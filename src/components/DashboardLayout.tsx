import { useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import { Home, HelpCircle } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar, BottomNav, type SidebarItem } from "./DashboardSidebar";
import { authService, paymentService } from "@/services/backendService";

export function DashboardLayout({ items, brandLabel, title }: {
  items: SidebarItem[]; brandLabel: string; title: string;
}) {
  useEffect(() => {
    const user = authService.getStoredUser();
    authService.getMe().catch(() => {});
    if (user?.role === "user")    paymentService.getMyBookings().catch(() => {});
    if (user?.role === "creator") paymentService.getMyCreatorBookings().catch(() => {});
  }, []);

  const user = authService.getStoredUser();
  const isUser = user?.role === "user" && brandLabel === "User";// Help button only for regular users, not admin/creator

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-secondary/30">

        {/* ── Desktop sidebar ───────────────────────────────────────────── */}
        <div className="hidden md:block">
          <DashboardSidebar items={items} brandLabel={brandLabel} />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          {/* ── Header ───────────────────────────────────────────────────── */}
          <header className="h-14 flex items-center gap-3 border-b border-border/60 bg-background px-4 sticky top-0 z-30">
            {/* Sidebar trigger only on desktop */}
            <div className="hidden md:block">
              <SidebarTrigger />
            </div>

            {/* Brand logo on mobile */}
            <div className="flex md:hidden items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent shrink-0">
                <span className="font-display font-bold text-xs text-accent-foreground">M</span>
              </span>
              <span className="font-display font-bold text-base">
                My<span className="text-accent">Fit</span>
              </span>
            </div>

            <h1 className="font-display font-semibold flex-1">{title}</h1>

            {/* ── Help button — users only ───────────────────────────────── */}
            {isUser && (
              <Link
                to="/dashboard/help"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                           text-accent border border-accent/30 bg-accent/5
                           hover:bg-accent/15 hover:border-accent/60 transition-colors shrink-0"
              >
                <HelpCircle size={15} />
                <span className="hidden sm:inline">Help</span>
              </Link>
            )}

            {/* ── Home button ───────────────────────────────────────────── */}
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                         text-muted-foreground hover:text-foreground hover:bg-accent/10
                         border border-border/60 hover:border-accent/40 transition-colors shrink-0"
            >
              <Home size={15} />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </header>

          {/* ── Main content ─────────────────────────────────────────────── */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
            <Outlet />
          </main>
        </div>
      </div>

      {/* ── Mobile bottom nav ─────────────────────────────────────────────── */}
      <BottomNav items={items} />
    </SidebarProvider>
  );
}