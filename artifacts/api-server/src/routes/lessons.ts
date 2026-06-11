import { Router, type IRouter } from "express";
import { eq, asc, and, isNull } from "drizzle-orm";
import { db, lessonsTable, lessonProgressTable, quizzesTable, quizQuestionsTable, quizAttemptsTable } from "@workspace/db";
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

  const userId = req.isAuthenticated() ? req.user.id : null;
  const progressFilter = userId
    ? and(eq(lessonProgressTable.lessonId, lesson.id), eq(lessonProgressTable.userId, userId))
    : and(eq(lessonProgressTable.lessonId, lesson.id), isNull(lessonProgressTable.userId));

  const [progress] = await db.select().from(lessonProgressTable).where(progressFilter);

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
        explanation: q.explanation ?? null,
      })),
    })
  );
});

router.get("/progress", async (req, res): Promise<void> => {
  const userId = req.isAuthenticated() ? req.user.id : null;
  const progressFilter = userId
    ? eq(lessonProgressTable.userId, userId)
    : isNull(lessonProgressTable.userId);

  const progress = await db.select().from(lessonProgressTable).where(progressFilter);
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
  const userId = req.isAuthenticated() ? req.user.id : null;

  const progressFilter = userId
    ? and(eq(lessonProgressTable.lessonId, lessonId), eq(lessonProgressTable.userId, userId))
    : and(eq(lessonProgressTable.lessonId, lessonId), isNull(lessonProgressTable.userId));

  const [existing] = await db.select().from(lessonProgressTable).where(progressFilter);

  let result;
  if (existing) {
    [result] = await db
      .update(lessonProgressTable)
      .set({ completed, lastAccessedAt: new Date() })
      .where(eq(lessonProgressTable.id, existing.id))
      .returning();
  } else {
    [result] = await db
      .insert(lessonProgressTable)
      .values({ userId, lessonId, completed, lastAccessedAt: new Date() })
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
  const userId = req.isAuthenticated() ? req.user.id : null;

  const questions = await db
    .select()
    .from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.quizId, quizId));

  let correctAnswers = 0;
  const questionResults = questions.map((question) => {
    const answer = answers.find((a) => a.questionId === question.id);
    const selectedOption = answer?.selectedOption ?? -1;
    const correct = question.correctOption === selectedOption;
    if (correct) correctAnswers++;
    return {
      questionId: question.id,
      selectedOption,
      correctOption: question.correctOption,
      correct,
      explanation: question.explanation ?? null,
    };
  });

  const total = questions.length;
  const score = total > 0 ? Math.round((correctAnswers / total) * 100) : 0;
  const passed = score >= 70;

  const [attempt] = await db
    .insert(quizAttemptsTable)
    .values({ userId, quizId, score, totalQuestions: total, correctAnswers, passed })
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
      questionResults,
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

  const userId = req.isAuthenticated() ? req.user.id : null;
  const attemptsFilter = userId
    ? and(eq(quizAttemptsTable.quizId, quiz.id), eq(quizAttemptsTable.userId, userId))
    : and(eq(quizAttemptsTable.quizId, quiz.id), isNull(quizAttemptsTable.userId));

  const attempts = await db.select().from(quizAttemptsTable).where(attemptsFilter);

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
