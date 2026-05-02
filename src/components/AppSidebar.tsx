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
import { useLanguage } from "@/context/LanguageContext";

const items = [
  { titleKey: "nav.dashboard", url: "/", icon: LayoutDashboard },
  { titleKey: "nav.devices", url: "/devices", icon: MonitorSmartphone },
  { titleKey: "nav.demo", url: "/demo", icon: BarChart3 },
  { titleKey: "nav.reports", url: "/reports", icon: ScrollText },
  { titleKey: "nav.profile", url: "/profile", icon: UserRound },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { status, config } = useThingSpeak();
  const { t } = useLanguage();

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
              <span className="font-display text-base font-bold">{t("app.brandName")}</span>
              <span className="text-[11px] text-muted-foreground">{t("app.brandTagline")}</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
              {t("nav.analytics")}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = location.pathname === item.url;
                const label = t(item.titleKey);
                return (
                  <SidebarMenuItem key={item.titleKey}>
                    <SidebarMenuButton
                      asChild
                      tooltip={label}
                      className={
                        active
                          ? "bg-gradient-primary text-primary-foreground hover:bg-gradient-primary hover:text-primary-foreground shadow-md-soft h-11"
                          : "hover:bg-sidebar-accent h-11"
                      }
                    >
                      <NavLink to={item.url} end>
                        <item.icon className="h-[18px] w-[18px]" />
                        <span className="font-medium">{label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

    </Sidebar>
  );
}
