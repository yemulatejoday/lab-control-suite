import { NavLink, useLocation } from "react-router-dom";
import { BarChart3, LayoutDashboard, Leaf, MonitorSmartphone, ScrollText, UserRound } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useThingSpeak } from "@/context/ThingSpeakContext";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Devices", url: "/devices", icon: MonitorSmartphone },
  { title: "Demo", url: "/demo", icon: BarChart3 },
  { title: "Reports", url: "/reports", icon: ScrollText },
  { title: "Profile", url: "/profile", icon: UserRound },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { status, config } = useThingSpeak();

  const dotColor =
    status === "connected" ? "bg-success" : status === "loading" ? "bg-warning" : status === "error" ? "bg-destructive" : "bg-muted-foreground";

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b px-3 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-iot shadow-glow">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight animate-fade-in">
              <span className="font-display text-base font-bold">SprayBot Monitor</span>
              <span className="text-[11px] text-muted-foreground">Monitoring only</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
              Analytics
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={
                        active
                          ? "bg-gradient-primary text-primary-foreground hover:bg-gradient-primary hover:text-primary-foreground shadow-md-soft h-11"
                          : "hover:bg-sidebar-accent h-11"
                      }
                    >
                      <NavLink to={item.url} end>
                        <item.icon className="h-[18px] w-[18px]" />
                        <span className="font-medium">{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-3">
        {!collapsed ? (
          <div className="rounded-xl border bg-gradient-surface p-3 text-xs">
            <div className="flex items-center gap-2 font-semibold">
              <span className={`pulse-dot ${dotColor}`} />
              {status === "connected" ? "Bot Online" : status === "loading" ? "Searching for Bot…" : "Bot Offline"}
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className={`pulse-dot ${dotColor}`} />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
