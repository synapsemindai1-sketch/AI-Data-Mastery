import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { MainLayout } from "@/components/layout/main-layout";
import { LearnLayout } from "@/components/layout/learn-layout";

import Home from "@/pages/home";
import Courses from "@/pages/courses";
import CourseDetail from "@/pages/course-detail";
import CertificatePage from "@/pages/certificate";
import Lesson from "@/pages/lesson";
import Quiz from "@/pages/quiz";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      {/* Learn routes (sidebar layout) */}
      <Route path="/learn/:lessonId/quiz">
        {(params) => (
          <LearnLayout lessonId={params.lessonId}>
            <Quiz lessonId={parseInt(params.lessonId, 10)} />
          </LearnLayout>
        )}
      </Route>
      <Route path="/learn/:lessonId">
        {(params) => (
          <LearnLayout lessonId={params.lessonId}>
            <Lesson lessonId={parseInt(params.lessonId, 10)} />
          </LearnLayout>
        )}
      </Route>

      {/* Main app routes (navbar layout) */}
      <Route>
        <MainLayout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/courses" component={Courses} />
            <Route path="/courses/:id">
              {(params) => <CourseDetail id={parseInt(params.id, 10)} />}
            </Route>
            <Route path="/certificate/:courseId">
              {(params) => <CertificatePage courseId={parseInt(params.courseId, 10)} />}
            </Route>
            <Route path="/dashboard" component={Dashboard} />
            <Route component={NotFound} />
          </Switch>
        </MainLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
