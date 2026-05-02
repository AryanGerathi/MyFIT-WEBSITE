import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Dumbbell, LogOut } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { authService } from "@/services/backendService";

export type SidebarItem = { title: string; url: string; icon: LucideIcon };

// ── Desktop Sidebar ───────────────────────────────────────────────────────────
export function DashboardSidebar({ items, brandLabel }: { items: SidebarItem[]; brandLabel: string }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.clearSession();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2 px-2 py-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent shrink-0">
            <Dumbbell size={16} className="text-accent-foreground" />
          </span>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-display font-bold text-base text-sidebar-foreground">
                My<span className="text-accent">Fit</span>
              </span>
              <span className="text-[10px] text-sidebar-foreground/60 uppercase tracking-wider">
                {brandLabel}
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className={cn(
                          "flex items-center gap-2 rounded-md transition-colors",
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

// ── Mobile Bottom Nav ─────────────────────────────────────────────────────────
export function BottomNav({ items }: { items: SidebarItem[] }) {
  const { pathname } = useLocation();

  // Show max 5 items
  const navItems = items.slice(0, 5);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border/60">
      <div className="flex items-center justify-around px-1 py-1">
        {navItems.map((item) => {
          const active = pathname === item.url;
          return (
            <NavLink
              key={item.title}
              to={item.url}
              end
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl transition-colors min-w-0 flex-1",
                active ? "text-accent" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0 transition-transform", active && "scale-110")} />
              <span className={cn(
                "text-[10px] font-medium truncate w-full text-center leading-tight",
                active ? "text-accent" : "text-muted-foreground"
              )}>
                {item.title}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}