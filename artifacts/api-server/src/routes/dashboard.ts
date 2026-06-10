import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, lessonProgressTable, lessonsTable, modulesTable, coursesTable, quizAttemptsTable, quizzesTable, certificatesTable } from "@workspace/db";
import {
  GetDashboardSummaryResponse,
  GetCertificatesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const allProgress = await db.select().from(lessonProgressTable);
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

router.get("/certificates", async (_req, res): Promise<void> => {
  const certs = await db.select().from(certificatesTable);
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

export default router;
