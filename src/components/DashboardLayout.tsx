import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar, type SidebarItem } from "./DashboardSidebar";

export function DashboardLayout({ items, brandLabel, title }: { items: SidebarItem[]; brandLabel: string; title: string }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-secondary/30">
        <DashboardSidebar items={items} brandLabel={brandLabel} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b border-border/60 bg-background px-4 sticky top-0 z-30">
            <SidebarTrigger />
            <h1 className="font-display font-semibold">{title}</h1>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
