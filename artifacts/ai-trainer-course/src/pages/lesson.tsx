import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useGetLesson, useMarkLessonComplete, getGetProgressQueryKey, getGetLessonQueryKey } from "@workspace/api-client-react";
import { CheckCircle2, ChevronLeft, ChevronRight, ClipboardList, Clock, PlayCircle, FileText, Dumbbell, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function LessonTypeBadge({ type }: { type: string }) {
  const configs: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    video: { label: "Video", icon: <PlayCircle className="h-3.5 w-3.5" />, color: "bg-primary/10 text-primary border-primary/20" },
    reading: { label: "Reading", icon: <FileText className="h-3.5 w-3.5" />, color: "bg-chart-2/10 text-chart-2 border-chart-2/20" },
    quiz: { label: "Quiz Lesson", icon: <ClipboardList className="h-3.5 w-3.5" />, color: "bg-chart-3/10 text-chart-3 border-chart-3/20" },
    exercise: { label: "Exercise", icon: <Dumbbell className="h-3.5 w-3.5" />, color: "bg-chart-4/10 text-chart-4 border-chart-4/20" },
  };
  const config = configs[type] ?? { label: type, icon: <BookOpen className="h-3.5 w-3.5" />, color: "" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      {config.icon}{config.label}
    </span>
  );
}

export default function Lesson({ lessonId }: { lessonId: number }) {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [markingDone, setMarkingDone] = useState(false);

  const { data: lesson, isLoading } = useGetLesson(lessonId, { query: { enabled: !!lessonId } });
  const markComplete = useMarkLessonComplete({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProgressQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetLessonQueryKey(lessonId) });
        setMarkingDone(false);
      },
    },
  });

  const handleMarkComplete = () => {
    setMarkingDone(true);
    markComplete.mutate({ data: { lessonId, completed: true } });
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-8 max-w-4xl mx-auto w-full space-y-6">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div>
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-muted-foreground">Lesson not found.</p>
        </div>
      </div>
    );
  }

  const isCompleted = lesson.completed === true;

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <LessonTypeBadge type={lesson.type} />
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />{lesson.durationMinutes} min
            </span>
            {isCompleted && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                <CheckCircle2 className="h-3.5 w-3.5" />Completed
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight">{lesson.title}</h1>
        </div>

        {/* Video placeholder */}
        {lesson.type === "video" && (
          <div className="aspect-video bg-foreground/90 rounded-2xl mb-8 flex items-center justify-center relative overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-transparent" />
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                <PlayCircle className="h-10 w-10 text-white" />
              </div>
              <span className="text-white/80 text-sm font-medium">Play Video Lesson</span>
            </div>
          </div>
        )}

        {/* Content — rich markdown with images */}
        <div className="prose prose-slate dark:prose-invert max-w-none mb-10
          prose-headings:font-bold prose-headings:font-display
          prose-h1:text-2xl prose-h1:mt-8 prose-h1:mb-4
          prose-h2:text-xl prose-h2:mt-7 prose-h2:mb-3
          prose-h3:text-lg prose-h3:mt-5 prose-h3:mb-2
          prose-p:text-base prose-p:leading-relaxed prose-p:text-foreground/90 prose-p:mb-4
          prose-li:text-foreground/90 prose-li:leading-relaxed
          prose-strong:text-foreground prose-strong:font-semibold
          prose-blockquote:border-l-4 prose-blockquote:border-primary/40 prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:not-italic
          prose-blockquote:text-foreground/80
          prose-code:bg-muted prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-mono prose-code:text-foreground
          prose-pre:bg-muted prose-pre:rounded-xl prose-pre:p-4
          prose-img:rounded-2xl prose-img:shadow-md prose-img:my-6 prose-img:w-full prose-img:object-cover
          prose-a:text-primary prose-a:underline-offset-2
          prose-table:text-sm prose-th:bg-muted/60 prose-th:font-semibold
          prose-hr:border-border/50">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {lesson.content}
          </ReactMarkdown>
        </div>

        {/* Quiz CTA */}
        {lesson.hasQuiz && (
          <div className="bg-chart-3/5 border border-chart-3/20 rounded-2xl p-6 mb-8 flex items-center gap-4">
            <div className="bg-chart-3/10 p-3 rounded-xl">
              <ClipboardList className="h-6 w-6 text-chart-3" />
            </div>
            <div className="flex-1">
              <div className="font-semibold mb-1">Knowledge Check</div>
              <div className="text-sm text-muted-foreground">Test your understanding with a short quiz</div>
            </div>
            <Link href={`/learn/${lessonId}/quiz`}>
              <Button variant="outline" className="border-chart-3/30 text-chart-3 hover:bg-chart-3/10">
                Take Quiz
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Footer navigation */}
      <div className="border-t bg-background/95 backdrop-blur px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          {lesson.prevLessonId && (
            <Link href={`/learn/${lesson.prevLessonId}`}>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <ChevronLeft className="h-4 w-4" />Previous
              </Button>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isCompleted ? (
            <Button
              onClick={handleMarkComplete}
              disabled={markComplete.isPending || markingDone}
              size="sm"
              className="gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              Mark Complete
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              <CheckCircle2 className="h-4 w-4" />Completed
            </span>
          )}

          {lesson.nextLessonId && (
            <Link href={`/learn/${lesson.nextLessonId}`}>
              <Button size="sm" className="gap-1.5">
                Next<ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
