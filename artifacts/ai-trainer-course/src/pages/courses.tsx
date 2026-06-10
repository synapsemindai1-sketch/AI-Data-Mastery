import { Link } from "wouter";
import { useListCourses } from "@workspace/api-client-react";
import { Clock, BookOpen, Star, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function Courses() {
  const { data: courses, isLoading } = useListCourses();

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight mb-2">Course Catalog</h1>
          <p className="text-muted-foreground">Find the right program to advance your AI training skills.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search courses..." className="pl-9 bg-card" />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="border rounded-2xl overflow-hidden flex flex-col bg-card h-[400px]">
              <Skeleton className="h-48 w-full rounded-none" />
              <div className="p-5 flex-1 flex flex-col">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-4" />
                <div className="mt-auto">
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses?.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`}>
              <div className="group border rounded-2xl overflow-hidden flex flex-col bg-card hover-elevate transition-all h-full">
                <div className="relative h-48 overflow-hidden bg-muted">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge variant={course.level === 'Advanced' ? 'destructive' : course.level === 'Intermediate' ? 'default' : 'secondary'} className="shadow-sm">
                      {course.level}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <div className="text-sm font-medium text-primary mb-2">{course.category}</div>
                  <h3 className="font-bold text-xl mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-6">
                    {course.description}
                  </p>
                  
                  <div className="mt-auto">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {course.durationHours}h
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4" />
                        {course.totalLessons} lessons
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
