import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, coursesTable, modulesTable, lessonsTable, lessonProgressTable, quizAttemptsTable, quizzesTable } from "@workspace/db";
import {
  ListCoursesResponse,
  GetCourseParams,
  GetCourseResponse,
  GetCourseStatsParams,
  GetCourseStatsResponse,
  GetModuleParams,
  GetModuleResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/courses", async (req, res): Promise<void> => {
  const courses = await db.select().from(coursesTable).orderBy(coursesTable.id);

  const allProgress = await db.select().from(lessonProgressTable);
  const allLessons = await db.select().from(lessonsTable);

  const result = courses.map((c) => {
    const courseLessonIds = allLessons
      .filter((l) => {
        return false;
      })
      .map((l) => l.id);

    return {
      id: c.id,
      title: c.title,
      description: c.description,
      level: c.level,
      durationHours: c.durationHours,
      totalLessons: c.totalLessons,
      instructor: c.instructor,
      category: c.category,
      thumbnail: c.thumbnail,
      completionPercent: null,
    };
  });

  res.json(ListCoursesResponse.parse(result));
});

router.get("/courses/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetCourseParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, params.data.id));
  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }

  const modules = await db
    .select()
    .from(modulesTable)
    .where(eq(modulesTable.courseId, course.id))
    .orderBy(modulesTable.order);

  const allProgress = await db.select().from(lessonProgressTable);

  const moduleSummaries = await Promise.all(
    modules.map(async (m) => {
      const lessons = await db
        .select()
        .from(lessonsTable)
        .where(eq(lessonsTable.moduleId, m.id))
        .orderBy(lessonsTable.order);

      const completedLessons = lessons.filter((l) =>
        allProgress.some((p) => p.lessonId === l.id && p.completed)
      ).length;

      return {
        id: m.id,
        title: m.title,
        order: m.order,
        totalLessons: lessons.length,
        completedLessons,
      };
    })
  );

  const allLessons = await db
    .select({ id: lessonsTable.id })
    .from(lessonsTable)
    .where(
      sql`${lessonsTable.moduleId} IN (SELECT id FROM modules WHERE course_id = ${course.id})`
    );

  const completedCount = allProgress.filter(
    (p) => p.completed && allLessons.some((l) => l.id === p.lessonId)
  ).length;

  const completionPercent =
    allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;

  const courseDetail = {
    id: course.id,
    title: course.title,
    description: course.description,
    level: course.level,
    durationHours: course.durationHours,
    totalLessons: course.totalLessons,
    instructor: course.instructor,
    category: course.category,
    thumbnail: course.thumbnail,
    objectives: course.objectives,
    prerequisites: course.prerequisites,
    modules: moduleSummaries,
    completionPercent,
  };

  res.json(GetCourseResponse.parse(courseDetail));
});

router.get("/courses/:id/stats", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetCourseStatsParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, params.data.id));
  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }

  const modules = await db.select().from(modulesTable).where(eq(modulesTable.courseId, course.id));

  const moduleIds = modules.map((m) => m.id);
  let allLessons: (typeof lessonsTable.$inferSelect)[] = [];
  for (const mid of moduleIds) {
    const ls = await db.select().from(lessonsTable).where(eq(lessonsTable.moduleId, mid));
    allLessons = allLessons.concat(ls);
  }

  const lessonIds = allLessons.map((l) => l.id);
  const allProgress = await db.select().from(lessonProgressTable);
  const courseProgress = allProgress.filter((p) => lessonIds.includes(p.lessonId));
  const completedLessons = courseProgress.filter((p) => p.completed).length;

  const totalDuration = allLessons.reduce((acc, l) => acc + l.durationMinutes, 0);
  const completedDuration = allLessons
    .filter((l) => courseProgress.some((p) => p.lessonId === l.id && p.completed))
    .reduce((acc, l) => acc + l.durationMinutes, 0);
  const remaining = totalDuration - completedDuration;

  const quizLessonIds = allLessons.filter((l) => l.hasQuiz).map((l) => l.id);
  let quizzesPassed = 0;
  for (const lid of quizLessonIds) {
    const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.lessonId, lid));
    if (quiz) {
      const attempts = await db.select().from(quizAttemptsTable).where(eq(quizAttemptsTable.quizId, quiz.id));
      if (attempts.some((a) => a.passed)) quizzesPassed++;
    }
  }

  res.json(
    GetCourseStatsResponse.parse({
      courseId: course.id,
      totalLessons: allLessons.length,
      completedLessons,
      completionPercent: allLessons.length > 0 ? Math.round((completedLessons / allLessons.length) * 100) : 0,
      totalDurationMinutes: totalDuration,
      estimatedTimeRemainingMinutes: remaining,
      quizzesPassed,
    })
  );
});

router.get("/modules/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetModuleParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [mod] = await db.select().from(modulesTable).where(eq(modulesTable.id, params.data.id));
  if (!mod) {
    res.status(404).json({ error: "Module not found" });
    return;
  }

  const lessons = await db
    .select()
    .from(lessonsTable)
    .where(eq(lessonsTable.moduleId, mod.id))
    .orderBy(lessonsTable.order);

  const allProgress = await db.select().from(lessonProgressTable);

  const lessonSummaries = lessons.map((l) => {
    const progress = allProgress.find((p) => p.lessonId === l.id);
    return {
      id: l.id,
      moduleId: l.moduleId,
      title: l.title,
      type: l.type,
      durationMinutes: l.durationMinutes,
      order: l.order,
      completed: progress?.completed ?? null,
    };
  });

  res.json(
    GetModuleResponse.parse({
      id: mod.id,
      courseId: mod.courseId,
      title: mod.title,
      order: mod.order,
      lessons: lessonSummaries,
    })
  );
});

export default router;
