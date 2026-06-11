import { pgTable, text, serial, integer, boolean, timestamp, real, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const levelEnum = pgEnum("level", ["Beginner", "Intermediate", "Advanced"]);
export const lessonTypeEnum = pgEnum("lesson_type", ["video", "reading", "quiz", "exercise"]);

export const coursesTable = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  level: levelEnum("level").notNull(),
  durationHours: real("duration_hours").notNull(),
  totalLessons: integer("total_lessons").notNull().default(0),
  instructor: text("instructor").notNull(),
  category: text("category").notNull(),
  thumbnail: text("thumbnail").notNull(),
  objectives: text("objectives").array().notNull().default([]),
  prerequisites: text("prerequisites").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const modulesTable = pgTable("modules", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => coursesTable.id),
  title: text("title").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const lessonsTable = pgTable("lessons", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").notNull().references(() => modulesTable.id),
  title: text("title").notNull(),
  type: lessonTypeEnum("type").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  order: integer("order").notNull(),
  content: text("content").notNull().default(""),
  videoUrl: text("video_url"),
  hasQuiz: boolean("has_quiz").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const quizzesTable = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id").notNull().references(() => lessonsTable.id),
  title: text("title").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const quizQuestionsTable = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").notNull().references(() => quizzesTable.id),
  question: text("question").notNull(),
  options: text("options").array().notNull(),
  correctOption: integer("correct_option").notNull(),
  explanation: text("explanation"),
  order: integer("order").notNull(),
});

export const lessonProgressTable = pgTable("lesson_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  lessonId: integer("lesson_id").notNull().references(() => lessonsTable.id),
  completed: boolean("completed").notNull().default(false),
  lastAccessedAt: timestamp("last_accessed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const quizAttemptsTable = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  quizId: integer("quiz_id").notNull().references(() => quizzesTable.id),
  score: real("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  passed: boolean("passed").notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const certificatesTable = pgTable("certificates", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  courseId: integer("course_id").notNull().references(() => coursesTable.id),
  issuedAt: timestamp("issued_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCourseSchema = createInsertSchema(coursesTable).omit({ id: true, createdAt: true });
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof coursesTable.$inferSelect;
export type Module = typeof modulesTable.$inferSelect;
export type Lesson = typeof lessonsTable.$inferSelect;
export type Quiz = typeof quizzesTable.$inferSelect;
export type QuizQuestion = typeof quizQuestionsTable.$inferSelect;
export type LessonProgress = typeof lessonProgressTable.$inferSelect;
export type QuizAttempt = typeof quizAttemptsTable.$inferSelect;
export type Certificate = typeof certificatesTable.$inferSelect;
