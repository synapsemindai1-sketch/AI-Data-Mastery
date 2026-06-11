import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetLessonQuiz,
  useSubmitQuizAttempt,
  useGetQuizAttempts,
  getGetQuizAttemptsQueryKey,
  getGetProgressQueryKey,
  useMarkLessonComplete,
} from "@workspace/api-client-react";
import { useState } from "react";
import { CheckCircle2, XCircle, ChevronLeft, Trophy, RotateCcw, ArrowRight, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

type Answer = { questionId: number; selectedOption: number };
type QuestionResult = {
  questionId: number;
  selectedOption: number;
  correctOption: number;
  correct: boolean;
  explanation?: string | null;
};

export default function Quiz({ lessonId }: { lessonId: number }) {
  const queryClient = useQueryClient();
  const { data: quiz, isLoading } = useGetLessonQuiz(lessonId, { query: { enabled: !!lessonId } });
  const { data: previousAttempts } = useGetQuizAttempts(lessonId, { query: { enabled: !!lessonId } });
  const submitAttempt = useSubmitQuizAttempt();
  const markComplete = useMarkLessonComplete();

  const [answers, setAnswers] = useState<Answer[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    passed: boolean;
    questionResults?: QuestionResult[];
  } | null>(null);

  const lastAttempt = previousAttempts?.[previousAttempts.length - 1];

  const handleSelect = (questionId: number, optionIdx: number) => {
    if (submitted) return;
    setAnswers((prev) => {
      const existing = prev.findIndex((a) => a.questionId === questionId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { questionId, selectedOption: optionIdx };
        return updated;
      }
      return [...prev, { questionId, selectedOption: optionIdx }];
    });
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    const res = await submitAttempt.mutateAsync({
      data: { quizId: quiz.id, answers },
    });
    setResult(res as typeof result);
    setSubmitted(true);
    queryClient.invalidateQueries({ queryKey: getGetQuizAttemptsQueryKey(lessonId) });
    if (res.passed) {
      markComplete.mutate({ data: { lessonId, completed: true } });
      queryClient.invalidateQueries({ queryKey: getGetProgressQueryKey() });
    }
  };

  const handleRetry = () => {
    setAnswers([]);
    setSubmitted(false);
    setResult(null);
  };

  const allAnswered = quiz ? answers.length === quiz.questions.length : false;
  const progress = quiz ? Math.round((answers.length / Math.max(quiz.questions.length, 1)) * 100) : 0;

  if (isLoading) {
    return (
      <div className="flex-1 p-8 max-w-3xl mx-auto w-full space-y-6">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-2 w-full" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-6 w-full" />
            {[1, 2, 3, 4].map((j) => <Skeleton key={j} className="h-12 w-full rounded-xl" />)}
          </div>
        ))}
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div>
          <ClipboardList className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-muted-foreground mb-4">No quiz available for this lesson.</p>
          <Link href={`/learn/${lessonId}`}>
            <Button variant="outline">
              <ChevronLeft className="h-4 w-4 mr-1" />Back to Lesson
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (submitted && result) {
    const qResults = result.questionResults ?? [];
    return (
      <div className="flex-1 flex flex-col">
        <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
          {/* Score header */}
          <div className="text-center mb-10">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${result.passed ? "bg-primary/10" : "bg-destructive/10"}`}>
              {result.passed
                ? <Trophy className="h-10 w-10 text-primary" />
                : <XCircle className="h-10 w-10 text-destructive" />
              }
            </div>
            <h2 className="text-2xl font-bold font-display mb-2">
              {result.passed ? "Quiz Passed!" : "Not Quite Yet"}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              {result.passed
                ? "Great work. This lesson is now marked complete."
                : `You need 70% to pass. You scored ${result.score}% — review the explanations below and try again.`
              }
            </p>
            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-8">
              <div className="bg-card border rounded-xl p-3 text-center">
                <div className="text-2xl font-bold font-display mb-0.5">{result.score}%</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Score</div>
              </div>
              <div className="bg-card border rounded-xl p-3 text-center">
                <div className="text-2xl font-bold font-display text-primary mb-0.5">{result.correctAnswers}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Correct</div>
              </div>
              <div className="bg-card border rounded-xl p-3 text-center">
                <div className="text-2xl font-bold font-display mb-0.5">{result.totalQuestions}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Total</div>
              </div>
            </div>
          </div>

          {/* Answer review */}
          {qResults.length > 0 && (
            <div className="space-y-6 mb-8">
              <h3 className="text-lg font-semibold font-display">Answer Review</h3>
              {quiz.questions.map((q, qIdx) => {
                const qr = qResults.find((r) => r.questionId === q.id);
                if (!qr) return null;
                return (
                  <div key={q.id} className={`rounded-2xl border p-5 ${qr.correct ? "border-primary/30 bg-primary/5" : "border-destructive/30 bg-destructive/5"}`}>
                    <div className="flex items-start gap-3 mb-4">
                      <span className={`shrink-0 w-7 h-7 rounded-full text-sm font-bold flex items-center justify-center ${qr.correct ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`}>
                        {qIdx + 1}
                      </span>
                      <p className="font-medium text-base leading-relaxed">{q.question}</p>
                    </div>
                    <div className="space-y-2 ml-10">
                      {q.options.map((option, optIdx) => {
                        const isSelected = qr.selectedOption === optIdx;
                        const isCorrect = qr.correctOption === optIdx;
                        let cls = "w-full text-left px-4 py-2.5 rounded-xl border text-sm flex items-center gap-3 ";
                        if (isCorrect) cls += "border-primary/50 bg-primary/10 text-primary font-medium";
                        else if (isSelected && !isCorrect) cls += "border-destructive/50 bg-destructive/10 text-destructive";
                        else cls += "border-border/40 text-muted-foreground";
                        return (
                          <div key={optIdx} className={cls}>
                            <span className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold ${isCorrect ? "bg-primary border-primary text-primary-foreground" : isSelected ? "bg-destructive border-destructive text-destructive-foreground" : "border-border/40"}`}>
                              {isCorrect ? "✓" : isSelected ? "✗" : ""}
                            </span>
                            {option}
                            {isCorrect && <span className="ml-auto text-xs font-normal opacity-60">Correct answer</span>}
                          </div>
                        );
                      })}
                    </div>
                    {qr.explanation && (
                      <div className="mt-4 ml-10 bg-background/60 border border-border/40 rounded-xl px-4 py-3">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Explanation</span>
                        <p className="text-sm text-foreground/80 leading-relaxed">{qr.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {!result.passed && (
              <Button variant="outline" onClick={handleRetry} className="gap-2">
                <RotateCcw className="h-4 w-4" />Try Again
              </Button>
            )}
            <Link href={`/learn/${lessonId}`}>
              <Button variant={result.passed ? "outline" : "default"} className="gap-2 w-full sm:w-auto">
                <ChevronLeft className="h-4 w-4" />Back to Lesson
              </Button>
            </Link>
            {result.passed && (
              <Link href="/dashboard">
                <Button className="gap-2">
                  View Dashboard<ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/learn/${lessonId}`}>
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
              <ChevronLeft className="h-4 w-4" />Back to lesson
            </button>
          </Link>
          <h1 className="text-2xl font-bold font-display mb-2">{quiz.title}</h1>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-muted-foreground">{answers.length} of {quiz.questions.length} answered</span>
            {lastAttempt && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                Previous best: {lastAttempt.score}%
              </span>
            )}
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Questions */}
        <div className="space-y-8">
          {quiz.questions.map((q, qIdx) => {
            const selected = answers.find((a) => a.questionId === q.id);
            return (
              <div key={q.id} className="bg-card border rounded-2xl p-6">
                <div className="flex items-start gap-3 mb-5">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">{qIdx + 1}</span>
                  <p className="font-medium text-base leading-relaxed">{q.question}</p>
                </div>
                <div className="space-y-2.5 ml-10">
                  {q.options.map((option, optIdx) => {
                    const isSelected = selected?.selectedOption === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelect(q.id, optIdx)}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary font-medium"
                            : "border-border hover:border-primary/40 hover:bg-muted/50"
                        }`}
                      >
                        <span className="inline-flex items-center gap-2.5">
                          <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? "bg-primary border-primary" : "border-border"}`}>
                            {isSelected && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                          </span>
                          {option}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!allAnswered || submitAttempt.isPending}
            size="lg"
            className="h-12 px-8"
          >
            {submitAttempt.isPending ? "Submitting..." : "Submit Quiz"}
          </Button>
        </div>
      </div>
    </div>
  );
}
