import { Link } from "wouter";
import { useGetCourse, useGetCourseStats, useGetProgress, useGetModule, useGetCertificates } from "@workspace/api-client-react";
import { Clock, BookOpen, ChevronRight, CheckCircle2, Circle, PlayCircle, FileText, ClipboardList, Dumbbell, Award, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

function LessonTypeIcon({ type }: { type: string }) {
  switch (type) {
    case "video": return <PlayCircle className="h-4 w-4 text-primary" />;
    case "reading": return <FileText className="h-4 w-4 text-chart-2" />;
    case "quiz": return <ClipboardList className="h-4 w-4 text-chart-3" />;
    case "exercise": return <Dumbbell className="h-4 w-4 text-chart-4" />;
    default: return <Circle className="h-4 w-4" />;
  }
}

function ModuleLessons({ moduleId, completedIds }: { moduleId: number; completedIds: Set<number> }) {
  const { data: mod } = useGetModule(moduleId, { query: { enabled: !!moduleId } });

  if (!mod) {
    return (
      <div className="p-4 space-y-2">
        <div className="h-4 bg-muted animate-pulse rounded" />
        <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
      </div>
    );
  }

  return (
    <div className="divide-y">
      {mod.lessons.map((lesson) => {
        const isCompleted = completedIds.has(lesson.id) || lesson.completed === true;
        return (
          <Link key={lesson.id} href={`/learn/${lesson.id}`}>
            <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/40 transition-colors cursor-pointer group">
              <div className="shrink-0">
                {isCompleted
                  ? <CheckCircle2 className="h-4 w-4 text-primary" />
                  : <LessonTypeIcon type={lesson.type} />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">{lesson.title}</div>
                <div className="text-xs text-muted-foreground capitalize">{lesson.type} · {lesson.durationMinutes} min</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function StartButton({ modules }: { modules: { id: number }[]; completionPercent: number }) {
  const firstModId = modules[0]?.id;
  const { data: firstMod } = useGetModule(firstModId ?? 0, { query: { enabled: !!firstModId } });
  const firstLessonId = firstMod?.lessons[0]?.id;

  if (!firstLessonId) {
    return <Button className="w-full" disabled>Loading...</Button>;
  }

  return (
    <Link href={`/learn/${firstLessonId}`}>
      <Button className="w-full h-11">
        Start Course
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </Link>
  );
}

export default function CourseDetail({ id }: { id: number }) {
  const { data: course, isLoading } = useGetCourse(id, { query: { enabled: !!id } });
  const { data: stats } = useGetCourseStats(id, { query: { enabled: !!id } });
  const { data: progress } = useGetProgress();
  const { data: certificates } = useGetCertificates();

  const completedLessonIds = new Set(
    (progress ?? []).filter((p) => p.completed).map((p) => p.lessonId)
  );

  const hasCertificate = certificates?.some((c) => c.courseId === id);
  const isComplete = stats && stats.completionPercent === 100;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <Skeleton className="h-64 w-full rounded-2xl mb-8" />
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Course not found.</p>
        <Link href="/courses"><Button className="mt-4">Back to Catalog</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative bg-foreground text-background py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-cover bg-center" style={{ backgroundImage: `url(${course.thumbnail})` }} />
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <Link href="/courses">
            <button className="flex items-center gap-1.5 text-sm text-background/70 hover:text-background mb-6 transition-colors">
              <ChevronLeft className="h-4 w-4" />
              Back to Catalog
            </button>
          </Link>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className="bg-primary text-primary-foreground border-0">{course.level}</Badge>
            <Badge className="bg-background/20 text-background border-background/30">{course.category}</Badge>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold font-display tracking-tight mb-4 max-w-3xl">
            {course.title}
          </h1>
          <p className="text-background/80 text-lg max-w-2xl mb-6 leading-relaxed">
            {course.description}
          </p>
          <div className="flex flex-wrap items-center gap-6 text-sm text-background/70">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {course.durationHours}h total
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              {course.totalLessons} lessons
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="h-4 w-4" />
              Certificate on completion
            </div>
          </div>
          <div className="mt-4 text-sm text-background/60">
            Taught by <span className="text-background font-medium">{course.instructor}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left: curriculum */}
          <div className="md:col-span-2 space-y-8">
            {/* Progress bar if any progress */}
            {stats && stats.completedLessons > 0 && (
              <div className="bg-card border rounded-2xl p-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold">Your Progress</span>
                  <span className="text-sm font-medium text-primary">{stats.completionPercent}% complete</span>
                </div>
                <Progress value={stats.completionPercent} className="h-2 mb-3" />
                <div className="flex gap-6 text-sm text-muted-foreground">
                  <span>{stats.completedLessons} of {stats.totalLessons} lessons done</span>
                  <span>{Math.round(stats.estimatedTimeRemainingMinutes / 60 * 10) / 10}h remaining</span>
                </div>
              </div>
            )}

            {/* What you'll learn */}
            {course.objectives.length > 0 && (
              <div>
                <h2 className="text-xl font-bold font-display mb-4">What you'll learn</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {course.objectives.map((obj, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Curriculum */}
            <div>
              <h2 className="text-xl font-bold font-display mb-4">Curriculum</h2>
              <div className="space-y-4">
                {course.modules.map((mod, modIdx) => (
                  <div key={mod.id} className="border rounded-xl overflow-hidden bg-card">
                    <div className="flex items-center justify-between px-5 py-4 bg-muted/40 border-b">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Module {modIdx + 1}</span>
                      <div className="text-sm text-muted-foreground">
                        {mod.completedLessons ?? 0}/{mod.totalLessons} done
                      </div>
                    </div>
                    <div className="px-5 py-3 font-semibold border-b">{mod.title}</div>
                    <ModuleLessons moduleId={mod.id} completedIds={completedLessonIds} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: sidebar card */}
          <div className="space-y-4">
            <div className="sticky top-24 bg-card border rounded-2xl overflow-hidden shadow-sm">
              <img src={course.thumbnail} alt={course.title} className="w-full h-44 object-cover" />
              <div className="p-5 space-y-4">
                {hasCertificate ? (
                  <Link href={`/certificate/${id}`}>
                    <Button className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-white gap-2">
                      <Award className="h-4 w-4" />
                      View Certificate
                    </Button>
                  </Link>
                ) : isComplete ? (
                  <Link href={`/certificate/${id}`}>
                    <Button className="w-full h-11 gap-2">
                      <Award className="h-4 w-4" />
                      Claim Certificate
                    </Button>
                  </Link>
                ) : (
                  <StartButton modules={course.modules} completionPercent={course.completionPercent ?? 0} />
                )}
                {course.prerequisites.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Prerequisites</div>
                    <ul className="space-y-1.5">
                      {course.prerequisites.map((p, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <ChevronRight className="h-3.5 w-3.5 mt-0.5 shrink-0" />{p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
