import { Link } from "wouter";
import { useGetDashboardSummary, useGetCertificates, useListCourses, useGetProgress } from "@workspace/api-client-react";
import { Award, BookOpen, CheckCircle2, Clock, FlameIcon, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary();
  const { data: certificates } = useGetCertificates();
  const { data: courses } = useListCourses();
  const { data: progress } = useGetProgress();

  const completedLessonIds = new Set(
    (progress ?? []).filter((p) => p.completed).map((p) => p.lessonId)
  );

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display tracking-tight mb-1">Learning Dashboard</h1>
        <p className="text-muted-foreground">Track your progress and stay on course.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {summaryLoading ? (
          [1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)
        ) : (
          <>
            <StatCard
              icon={<BookOpen className="h-5 w-5 text-primary" />}
              label="Courses Enrolled"
              value={summary?.totalCoursesEnrolled ?? 0}
              bg="bg-primary/10"
            />
            <StatCard
              icon={<CheckCircle2 className="h-5 w-5 text-chart-2" />}
              label="Lessons Completed"
              value={summary?.totalLessonsCompleted ?? 0}
              bg="bg-chart-2/10"
            />
            <StatCard
              icon={<Clock className="h-5 w-5 text-chart-3" />}
              label="Hours Learned"
              value={`${summary?.totalHoursLearned ?? 0}h`}
              bg="bg-chart-3/10"
            />
            <StatCard
              icon={<FlameIcon className="h-5 w-5 text-chart-4" />}
              label="Day Streak"
              value={summary?.currentStreak ?? 0}
              bg="bg-chart-4/10"
            />
          </>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left: activity + recent */}
        <div className="md:col-span-2 space-y-6">
          {/* Weekly activity */}
          <div className="bg-card border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg font-display">Weekly Activity</h2>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            {summaryLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={summary?.weeklyProgress ?? []} barSize={24}>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis hide domain={[0, "auto"]} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    cursor={{ fill: "hsl(var(--muted))", radius: 4 }}
                    formatter={(value: number) => [`${value} lesson${value !== 1 ? "s" : ""}`, ""]}
                  />
                  <Bar dataKey="lessonsCompleted" radius={[4, 4, 0, 0]}>
                    {(summary?.weeklyProgress ?? []).map((entry, index) => (
                      <Cell
                        key={index}
                        fill={entry.lessonsCompleted > 0 ? "hsl(var(--primary))" : "hsl(var(--muted))"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Recent activity */}
          {summary && summary.recentLessons.length > 0 && (
            <div className="bg-card border rounded-2xl p-6">
              <h2 className="font-bold text-lg font-display mb-5">Recent Activity</h2>
              <div className="space-y-3">
                {summary.recentLessons.map((item) => (
                  <div key={item.lessonId} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{item.lessonTitle}</div>
                      <div className="text-xs text-muted-foreground truncate">{item.courseTitle}</div>
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0">
                      {new Date(item.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: courses + certs */}
        <div className="space-y-6">
          {/* My courses */}
          <div className="bg-card border rounded-2xl p-6">
            <h2 className="font-bold text-lg font-display mb-5">Your Courses</h2>
            {!courses ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-6">
                <BookOpen className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground mb-3">No courses yet</p>
                <Link href="/courses"><Button size="sm" variant="outline">Browse Catalog</Button></Link>
              </div>
            ) : (
              <div className="space-y-4">
                {courses.map((course) => {
                  const pct = course.completionPercent ?? 0;
                  return (
                    <Link key={course.id} href={`/courses/${course.id}`}>
                      <div className="hover:bg-muted/40 rounded-xl p-3 -mx-3 transition-colors cursor-pointer">
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-sm font-medium line-clamp-1 flex-1">{course.title}</div>
                          <Badge variant="outline" className="text-xs ml-2 shrink-0">{course.level}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={pct} className="h-1.5 flex-1" />
                          <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
                <Link href="/courses">
                  <Button variant="outline" size="sm" className="w-full mt-2">Browse All Courses</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Certificates */}
          <div className="bg-card border rounded-2xl p-6">
            <h2 className="font-bold text-lg font-display mb-5">Certificates</h2>
            {!certificates || certificates.length === 0 ? (
              <div className="text-center py-4">
                <Award className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Complete a course to earn your certificate</p>
              </div>
            ) : (
              <div className="space-y-3">
                {certificates.map((cert) => (
                  <div key={cert.id} className="border rounded-xl p-4 bg-gradient-to-br from-primary/5 to-transparent">
                    <div className="flex items-start gap-3">
                      <Award className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold">{cert.courseTitle}</div>
                        <div className="text-xs text-muted-foreground">{cert.instructor}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Issued {new Date(cert.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: string | number; bg: string }) {
  return (
    <div className="bg-card border rounded-2xl p-5">
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>{icon}</div>
      <div className="text-2xl font-bold font-display mb-0.5">{value}</div>
      <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</div>
    </div>
  );
}
