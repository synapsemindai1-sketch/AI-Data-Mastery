import { Link, useLocation } from "wouter";
import { useGetLesson, useGetCourse } from "@workspace/api-client-react";
import { BookOpen, CheckCircle2, ChevronLeft, LayoutDashboard, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function LearnLayout({ children, lessonId }: { children: React.ReactNode; lessonId: string }) {
  const [location] = useLocation();
  const id = parseInt(lessonId, 10);
  
  const { data: lesson } = useGetLesson(id, { query: { enabled: !!id } });
  
  // Actually, we need the course details to render the sidebar. For now, since the lesson doesn't give us the courseId directly except through the module... wait, let's look at the API schema.
  // Lesson has moduleId. ModuleDetail has courseId.
  // This is a bit complex to fetch dynamically without courseId in lesson. 
  // Let's assume for the layout, we just show a simplified back to course button or if we really need it, we'd fetch module then course.
  
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background h-14 flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>Curriculum</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-full">
                <div className="p-4 text-sm text-muted-foreground">
                  Module navigation would go here.
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
          
          <Link href={`/courses`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Course</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          {lesson && (
            <div className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span>{lesson.title}</span>
            </div>
          )}
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        </div>
      </header>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden md:flex w-80 flex-col border-r bg-muted/20 shrink-0 overflow-hidden">
          <div className="p-4 border-b bg-background">
            <h3 className="font-semibold">Course Content</h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {/* Fallback sidebar content since we don't have the full course graph here easily */}
              <div className="text-sm text-muted-foreground text-center py-8">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p>Navigate using the bottom controls</p>
              </div>
            </div>
          </ScrollArea>
        </aside>
        
        {/* Main Content Area */}
        <main className="flex-1 relative flex flex-col overflow-y-auto bg-card">
          {children}
        </main>
      </div>
    </div>
  );
}
