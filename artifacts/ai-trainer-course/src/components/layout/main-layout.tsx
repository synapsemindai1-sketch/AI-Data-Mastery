import { Link, useLocation } from "wouter";
import { BookOpen, LayoutDashboard, Search, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@workspace/replit-auth-web";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-primary">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="font-display font-bold text-xl hidden sm:inline-block tracking-tight">TrainerMastery</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link 
                href="/courses" 
                className={`transition-colors hover:text-foreground/80 ${location === '/courses' ? 'text-foreground' : 'text-foreground/60'}`}
              >
                Catalog
              </Link>
              <Link 
                href="/dashboard" 
                className={`transition-colors hover:text-foreground/80 ${location === '/dashboard' ? 'text-foreground' : 'text-foreground/60'}`}
              >
                Dashboard
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            {!isLoading && (
              isAuthenticated ? (
                <div className="flex items-center gap-2">
                  {user?.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt={user.firstName ?? "User"}
                      className="h-8 w-8 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      {(user?.firstName?.[0] ?? user?.email?.[0] ?? "U").toUpperCase()}
                    </div>
                  )}
                  <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hidden sm:flex">
                    <LogOut className="mr-1.5 h-4 w-4" />
                    Log out
                  </Button>
                </div>
              ) : (
                <Button size="sm" onClick={login}>
                  <LogIn className="mr-1.5 h-4 w-4" />
                  Log in
                </Button>
              )
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="border-t bg-muted/40 py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-primary">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">TrainerMastery</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The premier platform for AI data training and model fine-tuning education.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/courses" className="hover:text-primary transition-colors">Course Catalog</Link></li>
              <li><Link href="/dashboard" className="hover:text-primary transition-colors">Student Dashboard</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Certifications</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">Documentation</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Community</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-8 pt-8 border-t text-sm text-muted-foreground text-center">
          &copy; {new Date().getFullYear()} TrainerMastery. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
