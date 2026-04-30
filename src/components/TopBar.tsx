import { Bell, Wifi, Cloud } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation } from "react-router-dom";
import { useThingSpeak, ConnState } from "@/context/ThingSpeakContext";

const titles: Record<string, { t: string; s: string }> = {
  "/": { t: "Pesticide Spraying Bot Dashboard", s: "Real-Time Monitoring and Data Analytics" },
  "/devices": { t: "Connected Devices", s: "Monitor multiple spraying bots" },
  "/demo": { t: "Demo / Sample Data View", s: "Sample data shown before a bot is connected" },
  "/reports": { t: "Reports", s: "Read-only performance summaries" },
  "/profile": { t: "Profile", s: "User and monitoring access overview" },
};

function StatusPill({
  label,
  icon: Icon,
  state,
}: {
  label: string;
  icon: typeof Wifi;
  state: ConnState;
}) {
  const cfg =
    state === "connected"
      ? { tone: "success", text: "Connected" }
      : state === "loading"
      ? { tone: "warning", text: "Connecting…" }
      : state === "error"
      ? { tone: "destructive", text: "Error" }
      : { tone: "muted-foreground", text: "Offline" };

  const cls =
    state === "connected"
      ? "border-success/30 bg-success/10 text-success"
      : state === "loading"
      ? "border-warning/30 bg-warning/10 text-warning"
      : state === "error"
      ? "border-destructive/30 bg-destructive/10 text-destructive"
      : "border-muted-foreground/20 bg-muted/40 text-muted-foreground";

  return (
    <div
      className={`hidden md:flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${cls}`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden lg:inline">{label}</span>
      <span className={`pulse-dot bg-${cfg.tone}`} />
      <span>{cfg.text}</span>
    </div>
  );
}

export function TopBar() {
  const { pathname } = useLocation();
  const { t, s } = titles[pathname] ?? titles["/"];
  const { esp32, status } = useThingSpeak();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-xl md:px-6">
      <SidebarTrigger className="shrink-0" />

      <div className="hidden md:block min-w-0">
        <h1 className="font-display text-lg font-bold leading-none truncate">{t}</h1>
        <p className="mt-1 text-xs text-muted-foreground truncate">{s}</p>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <StatusPill label="ESP32" icon={Wifi} state={esp32} />
        <StatusPill label="ThingSpeak" icon={Cloud} state={status} />

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <Bell className="h-[1.2rem] w-[1.2rem]" />
              <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 justify-center rounded-full bg-warning px-1 text-[10px] font-semibold text-warning-foreground">
                2
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {[
              { t: "Tank level below 25%", d: "1 min ago", c: "warning" },
              { t: "ThingSpeak feed received", d: "8 min ago", c: "success" },
              { t: "ESP32 reconnected to WiFi", d: "20 min ago", c: "primary" },
            ].map((n, i) => (
              <DropdownMenuItem key={i} className="flex items-start gap-3 py-3">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full bg-${n.c}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium leading-tight">{n.t}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{n.d}</p>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 rounded-full pl-1 pr-3">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-gradient-iot text-xs font-semibold text-primary-foreground">
                  AG
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline">Agri Monitor User</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>Agri Monitor User</span>
                <span className="text-xs font-normal text-muted-foreground">monitor@agrispray.io</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Preferences</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* keep status reference to satisfy linter on unused */}
      <span className="hidden">{status}</span>
    </header>
  );
}
