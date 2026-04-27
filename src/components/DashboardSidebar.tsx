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