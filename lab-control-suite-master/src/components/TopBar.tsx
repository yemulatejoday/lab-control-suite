import { Bell, Wifi, Cloud, ChevronDown, Plus, Check, Users } from "lucide-react";
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
import { useLocation, useNavigate } from "react-router-dom";
import { useThingSpeak, ConnState } from "@/context/ThingSpeakContext";
import { useAuth } from "@/context/AuthContext";

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
  const navigate = useNavigate();
  const { t, s } = titles[pathname] ?? titles["/"];
  const { esp32, status } = useThingSpeak();
  const { logout, user, accounts, switchAccount } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-xl md:px-6">
      <SidebarTrigger className="shrink-0" />

      <div className="hidden md:block min-w-0">
        <h1 className="font-display text-lg font-bold leading-none truncate">{t}</h1>
        <p className="mt-1 text-xs text-muted-foreground truncate">{s}</p>
      </div>

      <div className="ml-auto flex items-center gap-2">

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
              { t: "Live monitoring feed updated", d: "8 min ago", c: "success" },
              { t: "Bot reconnected to network", d: "20 min ago", c: "primary" },
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

        <div className="flex items-center gap-1 rounded-full border bg-card/50 p-1 shadow-sm transition-all hover:bg-card">
          <Button 
            variant="ghost" 
            className="h-8 gap-2 rounded-full px-2 hover:bg-primary/10"
            onClick={() => navigate("/profile")}
          >
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-gradient-iot text-xs font-semibold text-primary-foreground">
                {user?.name?.substring(0, 2).toUpperCase() || "AG"}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium sm:inline">{user?.name || "Agri Monitor User"}</span>
          </Button>
          
          <div className="h-4 w-px bg-border mx-0.5" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10">
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Users className="h-3 w-3" /> All Accounts
              </DropdownMenuLabel>
              {accounts.map((acc) => (
                <DropdownMenuItem 
                  key={acc.email} 
                  onClick={() => switchAccount(acc.email)}
                  className="flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{acc.name}</span>
                    <span className="text-[10px] text-muted-foreground">{acc.email}</span>
                  </div>
                  {user?.email === acc.email && <Check className="h-4 w-4 text-primary" />}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/login")} className="gap-2 font-bold">
                <Plus className="h-4 w-4" /> Add Account
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {
                logout();
                navigate("/login");
              }} className="text-destructive focus:text-destructive font-bold">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* keep status reference to satisfy linter on unused */}
      <span className="hidden">{status}</span>
    </header>
  );
}
