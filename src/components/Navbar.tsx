import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Dumbbell, Moon, Sun, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { authService } from "@/services/backendService";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/explore", label: "Explore" },
  { to: "/signup?role=creator", label: "Become a Creator" },
];

export function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [dark, setDark] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<"user" | "creator" | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Re-check auth state on every route change
  useEffect(() => {
    const loggedIn = authService.isLoggedIn();
    setIsLoggedIn(loggedIn);
    if (loggedIn) {
      const user = authService.getStoredUser();
      setUserRole(user?.role ?? null);
    } else {
      setUserRole(null);
    }
  }, [pathname]);

  const dashboardUrl = userRole === "creator" ? "/creator-dashboard" : "/dashboard";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="container-app flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="grid h-9 w-9 place-items-center rounded-xl gradient-accent shadow-glow text-white">
            <Dumbbell size={18} />
          </span>
          <span className="font-display font-bold text-xl tracking-tight">
            My<span className="text-accent">Fit</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-md transition-colors hover:text-accent",
                pathname === l.to ? "text-accent" : "text-foreground/80",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setDark(!dark)} aria-label="Toggle theme">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </Button>

          {isLoggedIn ? (
            // ── Logged in: show Dashboard button ──────────────────────────
            <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground hidden sm:inline-flex">
              <Link to={dashboardUrl}>
                <LayoutDashboard size={16} className="mr-1.5" />
                Dashboard
              </Link>
            </Button>
          ) : (
            // ── Logged out: show Login + Get Started ──────────────────────
            <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground hidden sm:inline-flex">
                <Link to="/signup">Get Started</Link>
              </Button>
            </>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-2 mt-8">
                {navLinks.map((l) => (
                  <Link key={l.to} to={l.to} className="px-3 py-2 rounded-md hover:bg-secondary font-medium">
                    {l.label}
                  </Link>
                ))}
                {isLoggedIn ? (
                  <Link to={dashboardUrl} className="px-3 py-2 rounded-md hover:bg-secondary font-medium">
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="px-3 py-2 rounded-md hover:bg-secondary font-medium">
                      Login
                    </Link>
                    <Button asChild className="bg-accent text-accent-foreground mt-2">
                      <Link to="/signup">Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}