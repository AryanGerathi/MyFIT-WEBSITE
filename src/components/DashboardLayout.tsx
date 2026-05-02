import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar, BottomNav, type SidebarItem } from "./DashboardSidebar";

export function DashboardLayout({ items, brandLabel, title }: {
  items: SidebarItem[]; brandLabel: string; title: string;
}) {
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
            <h1 className="font-display font-semibold">{title}</h1>
          </header>

          {/* ── Main content — extra bottom padding on mobile for bottom nav ── */}
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