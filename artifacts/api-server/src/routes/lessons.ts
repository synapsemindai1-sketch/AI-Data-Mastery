import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, lessonsTable, lessonProgressTable, quizzesTable, quizQuestionsTable, quizAttemptsTable, modulesTable } from "@workspace/db";
import {
  GetLessonParams,
  GetLessonResponse,
  GetLessonQuizParams,
  GetLessonQuizResponse,
  GetProgressResponse,
  MarkLessonCompleteBody,
  MarkLessonCompleteResponse,
  SubmitQuizAttemptBody,
  SubmitQuizAttemptResponse,
  GetQuizAttemptsParams,
  GetQuizAttemptsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/lessons/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetLessonParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [lesson] = await db.select().from(lessonsTable).where(eq(lessonsTable.id, params.data.id));
  if (!lesson) {
    res.status(404).json({ error: "Lesson not found" });
    return;
  }

  const [progress] = await db
    .select()
    .from(lessonProgressTable)
    .where(eq(lessonProgressTable.lessonId, lesson.id));

  const siblingsRaw = await db
    .select()
    .from(lessonsTable)
    .where(eq(lessonsTable.moduleId, lesson.moduleId))
    .orderBy(asc(lessonsTable.order));

  const idx = siblingsRaw.findIndex((l) => l.id === lesson.id);
  const prevLessonId = idx > 0 ? siblingsRaw[idx - 1].id : null;
  const nextLessonId = idx < siblingsRaw.length - 1 ? siblingsRaw[idx + 1].id : null;

  res.json(
    GetLessonResponse.parse({
      id: lesson.id,
      moduleId: lesson.moduleId,
      title: lesson.title,
      type: lesson.type,
      durationMinutes: lesson.durationMinutes,
      order: lesson.order,
      content: lesson.content,
      videoUrl: lesson.videoUrl ?? null,
      hasQuiz: lesson.hasQuiz,
      completed: progress?.completed ?? null,
      nextLessonId,
      prevLessonId,
    })
  );
});

router.get("/lessons/:id/quiz", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetLessonQuizParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [quiz] = await db
    .select()
    .from(quizzesTable)
    .where(eq(quizzesTable.lessonId, params.data.id));

  if (!quiz) {
    res.status(404).json({ error: "No quiz for this lesson" });
    return;
  }

  const questions = await db
    .select()
    .from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.quizId, quiz.id))
    .orderBy(asc(quizQuestionsTable.order));

  res.json(
    GetLessonQuizResponse.parse({
      id: quiz.id,
      lessonId: quiz.lessonId,
      title: quiz.title,
      questions: questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
      })),
    })
  );
});

router.get("/progress", async (_req, res): Promise<void> => {
  const progress = await db.select().from(lessonProgressTable);
  res.json(
    GetProgressResponse.parse(
      progress.map((p) => ({
        lessonId: p.lessonId,
        completed: p.completed,
        lastAccessedAt: p.lastAccessedAt.toISOString(),
      }))
    )
  );
});

router.post("/progress", async (req, res): Promise<void> => {
  const parsed = MarkLessonCompleteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { lessonId, completed } = parsed.data;

  const [existing] = await db
    .select()
    .from(lessonProgressTable)
    .where(eq(lessonProgressTable.lessonId, lessonId));

  let result;
  if (existing) {
    [result] = await db
      .update(lessonProgressTable)
      .set({ completed, lastAccessedAt: new Date() })
      .where(eq(lessonProgressTable.lessonId, lessonId))
      .returning();
  } else {
    [result] = await db
      .insert(lessonProgressTable)
      .values({ lessonId, completed, lastAccessedAt: new Date() })
      .returning();
  }

  res.json(
    MarkLessonCompleteResponse.parse({
      lessonId: result.lessonId,
      completed: result.completed,
      lastAccessedAt: result.lastAccessedAt.toISOString(),
    })
  );
});

router.post("/quiz-attempts", async (req, res): Promise<void> => {
  const parsed = SubmitQuizAttemptBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { quizId, answers } = parsed.data;

  const questions = await db
    .select()
    .from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.quizId, quizId));

  let correctAnswers = 0;
  for (const answer of answers) {
    const question = questions.find((q) => q.id === answer.questionId);
    if (question && question.correctOption === answer.selectedOption) {
      correctAnswers++;
    }
  }

  const total = questions.length;
  const score = total > 0 ? Math.round((correctAnswers / total) * 100) : 0;
  const passed = score >= 70;

  const [attempt] = await db
    .insert(quizAttemptsTable)
    .values({ quizId, score, totalQuestions: total, correctAnswers, passed })
    .returning();

  res.json(
    SubmitQuizAttemptResponse.parse({
      id: attempt.id,
      quizId: attempt.quizId,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      correctAnswers: attempt.correctAnswers,
      passed: attempt.passed,
      completedAt: attempt.completedAt.toISOString(),
    })
  );
});

router.get("/quiz-attempts/lesson/:lessonId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.lessonId) ? req.params.lessonId[0] : req.params.lessonId;
  const params = GetQuizAttemptsParams.safeParse({ lessonId: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [quiz] = await db
    .select()
    .from(quizzesTable)
    .where(eq(quizzesTable.lessonId, params.data.lessonId));

  if (!quiz) {
    res.json(GetQuizAttemptsResponse.parse([]));
    return;
  }

  const attempts = await db
    .select()
    .from(quizAttemptsTable)
    .where(eq(quizAttemptsTable.quizId, quiz.id));

  res.json(
    GetQuizAttemptsResponse.parse(
      attempts.map((a) => ({
        id: a.id,
        quizId: a.quizId,
        score: a.score,
        totalQuestions: a.totalQuestions,
        correctAnswers: a.correctAnswers,
        passed: a.passed,
        completedAt: a.completedAt.toISOString(),
      }))
    )
  );
});

export default router;
