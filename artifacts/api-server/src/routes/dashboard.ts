import { Router, type IRouter } from "express";
import { eq, isNull, and } from "drizzle-orm";
import { db, lessonProgressTable, lessonsTable, modulesTable, coursesTable, quizAttemptsTable, certificatesTable } from "@workspace/db";
import {
  GetDashboardSummaryResponse,
  GetCertificatesResponse,
  IssueCertificateBody,
  IssueCertificateResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/summary", async (req, res): Promise<void> => {
  const userId = req.isAuthenticated() ? req.user.id : null;
  const progressFilter = userId
    ? eq(lessonProgressTable.userId, userId)
    : isNull(lessonProgressTable.userId);

  const allProgress = await db.select().from(lessonProgressTable).where(progressFilter);
  const completedProgress = allProgress.filter((p) => p.completed);

  const totalLessonsCompleted = completedProgress.length;
  const totalHoursLearned = completedProgress.length * 0.4;

  const courses = await db.select().from(coursesTable);
  const totalCoursesEnrolled = courses.length;

  const today = new Date();
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyProgress = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const dayName = days[d.getDay()];
    const dayStr = d.toDateString();
    const count = completedProgress.filter((p) => {
      const pd = new Date(p.lastAccessedAt);
      return pd.toDateString() === dayStr;
    }).length;
    return { day: dayName, lessonsCompleted: count };
  });

  const allLessons = await db.select().from(lessonsTable);
  const allModules = await db.select().from(modulesTable);

  const recentLessons = await Promise.all(
    completedProgress
      .sort((a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime())
      .slice(0, 5)
      .map(async (p) => {
        const lesson = allLessons.find((l) => l.id === p.lessonId);
        if (!lesson) return null;
        const mod = allModules.find((m) => m.id === lesson.moduleId);
        if (!mod) return null;
        const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, mod.courseId));
        return {
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          courseTitle: course?.title ?? "Unknown Course",
          completedAt: p.lastAccessedAt.toISOString(),
        };
      })
  );

  const validRecentLessons = recentLessons.filter((r) => r !== null) as {
    lessonId: number;
    lessonTitle: string;
    courseTitle: string;
    completedAt: string;
  }[];

  const streak = Math.min(totalLessonsCompleted, 7);

  res.json(
    GetDashboardSummaryResponse.parse({
      totalCoursesEnrolled,
      totalLessonsCompleted,
      totalHoursLearned: Math.round(totalHoursLearned * 10) / 10,
      currentStreak: streak,
      weeklyProgress,
      recentLessons: validRecentLessons,
    })
  );
});

router.get("/certificates", async (req, res): Promise<void> => {
  const userId = req.isAuthenticated() ? req.user.id : null;
  const certsFilter = userId
    ? eq(certificatesTable.userId, userId)
    : isNull(certificatesTable.userId);

  const certs = await db.select().from(certificatesTable).where(certsFilter);
  const courses = await db.select().from(coursesTable);

  const result = certs.map((cert) => {
    const course = courses.find((c) => c.id === cert.courseId);
    return {
      id: cert.id,
      courseId: cert.courseId,
      courseTitle: course?.title ?? "Unknown Course",
      issuedAt: cert.issuedAt.toISOString(),
      instructor: course?.instructor ?? "Unknown Instructor",
    };
  });

  res.json(GetCertificatesResponse.parse(result));
});

router.post("/certificates", async (req, res): Promise<void> => {
  const parsed = IssueCertificateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid request body" });
    return;
  }
  const { courseId } = parsed.data;
  const userId = req.isAuthenticated() ? req.user.id : null;

  // Check if certificate already exists
  const existingFilter = userId
    ? and(eq(certificatesTable.courseId, courseId), eq(certificatesTable.userId, userId))
    : and(eq(certificatesTable.courseId, courseId), isNull(certificatesTable.userId));
  const existing = await db.select().from(certificatesTable).where(existingFilter);
  if (existing.length > 0) {
    const course = await db.select().from(coursesTable).where(eq(coursesTable.id, courseId));
    res.json(IssueCertificateResponse.parse({
      id: existing[0].id,
      courseId: existing[0].courseId,
      courseTitle: course[0]?.title ?? "Unknown Course",
      issuedAt: existing[0].issuedAt.toISOString(),
      instructor: course[0]?.instructor ?? "Unknown Instructor",
    }));
    return;
  }

  // Verify all lessons in the course are completed
  const modules = await db.select().from(modulesTable).where(eq(modulesTable.courseId, courseId));
  const moduleIds = modules.map((m) => m.id);
  const allLessons = await db.select().from(lessonsTable);
  const courseLessons = allLessons.filter((l) => moduleIds.includes(l.moduleId));

  if (courseLessons.length === 0) {
    res.status(400).json({ message: "Course has no lessons" });
    return;
  }

  const progressFilter = userId
    ? eq(lessonProgressTable.userId, userId)
    : isNull(lessonProgressTable.userId);
  const allProgress = await db.select().from(lessonProgressTable).where(progressFilter);
  const completedIds = new Set(allProgress.filter((p) => p.completed).map((p) => p.lessonId));
  const allComplete = courseLessons.every((l) => completedIds.has(l.id));

  if (!allComplete) {
    res.status(400).json({ message: "Not all lessons are completed" });
    return;
  }

  const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, courseId));
  if (!course) {
    res.status(400).json({ message: "Course not found" });
    return;
  }

  const [cert] = await db
    .insert(certificatesTable)
    .values({ userId, courseId, issuedAt: new Date() })
    .returning();

  res.json(IssueCertificateResponse.parse({
    id: cert.id,
    courseId: cert.courseId,
    courseTitle: course.title,
    issuedAt: cert.issuedAt.toISOString(),
    instructor: course.instructor,
  }));
});

export default router;
