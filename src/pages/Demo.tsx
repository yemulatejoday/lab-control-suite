import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  AlertTriangle,
  BatteryCharging,
  Clock3,
  Droplets,
  MapPinned,
  Plus,
  Route,
  SprayCan,
  Tractor,
  WifiOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DemoLog = {
  ts: string;
  event: string;
  detail: string;
  status: "success" | "warning" | "info" | "error";
};

type DemoBot = {
  id: string;
  name: string;
  status: "Active" | "Offline" | "Error";
  distance: number;
  area: number;
  pesticide: number;
  time: string;
  battery: number;
  tank: number;
  alerts: string[];
  distanceTrend: { time: string; distance: number }[];
  pesticideTrend: { time: string; liters: number }[];
  logs: DemoLog[];
};

const demoBots: DemoBot[] = [
  {
    id: "DEMO-BOT-01",
    name: "Greenhouse Alpha",
    status: "Active",
    distance: 2400,
    area: 2.7,
    pesticide: 3.2,
    time: "2h 15m",
    battery: 78,
    tank: 64,
    alerts: [],
    distanceTrend: [
      { time: "08:00", distance: 0.2 },
      { time: "08:30", distance: 0.8 },
      { time: "09:00", distance: 1.3 },
      { time: "09:30", distance: 1.9 },
      { time: "10:00", distance: 2.4 },
    ],
    pesticideTrend: [
      { time: "08:00", liters: 0.4 },
      { time: "08:30", liters: 0.7 },
      { time: "09:00", liters: 0.9 },
      { time: "09:30", liters: 0.6 },
      { time: "10:00", liters: 0.6 },
    ],
    logs: [
      { ts: "2026-05-02 08:12", event: "Telemetry Update", detail: "Tank level at 64%", status: "info" },
      { ts: "2026-05-02 08:28", event: "Coverage Update", detail: "Area covered reached 1.2 acres", status: "success" },
      { ts: "2026-05-02 09:02", event: "Spray Session", detail: "Pesticide output stabilized at 0.9 L", status: "info" },
    ],
  },
  {
    id: "DEMO-BOT-02",
    name: "Field Delta",
    status: "Active",
    distance: 1780,
    area: 1.9,
    pesticide: 2.4,
    time: "1h 42m",
    battery: 18,
    tank: 42,
    alerts: ["alerts.lowBattery"],
    distanceTrend: [
      { time: "10:00", distance: 0.3 },
      { time: "10:20", distance: 0.7 },
      { time: "10:40", distance: 1.1 },
      { time: "11:00", distance: 1.5 },
      { time: "11:20", distance: 1.78 },
    ],
    pesticideTrend: [
      { time: "10:00", liters: 0.3 },
      { time: "10:20", liters: 0.5 },
      { time: "10:40", liters: 0.6 },
      { time: "11:00", liters: 0.6 },
      { time: "11:20", liters: 0.4 },
    ],
    logs: [
      { ts: "2026-05-02 10:12", event: "Battery Warning", detail: "Battery dropped below 20%", status: "warning" },
      { ts: "2026-05-02 10:36", event: "Telemetry Update", detail: "Distance traveled reached 1.1 km", status: "info" },
      { ts: "2026-05-02 11:05", event: "Coverage Update", detail: "Area covered reached 1.9 acres", status: "success" },
    ],
  },
  {
    id: "DEMO-BOT-03",
    name: "Orchard Sigma",
    status: "Offline",
    distance: 980,
    area: 1.1,
    pesticide: 1.3,
    time: "58m",
    battery: 52,
    tank: 81,
    alerts: ["Telemetry delayed"],
    distanceTrend: [
      { time: "12:00", distance: 0.2 },
      { time: "12:20", distance: 0.4 },
      { time: "12:40", distance: 0.6 },
      { time: "13:00", distance: 0.8 },
      { time: "13:20", distance: 0.98 },
    ],
    pesticideTrend: [
      { time: "12:00", liters: 0.2 },
      { time: "12:20", liters: 0.3 },
      { time: "12:40", liters: 0.3 },
      { time: "13:00", liters: 0.3 },
      { time: "13:20", liters: 0.2 },
    ],
    logs: [
      { ts: "2026-05-02 12:18", event: "Signal Loss", detail: "Telemetry feed paused", status: "error" },
      { ts: "2026-05-02 12:26", event: "Reconnect Attempt", detail: "Retrying connection to ESP32", status: "warning" },
      { ts: "2026-05-02 12:40", event: "Last Data", detail: "Last known tank level 81%", status: "info" },
    ],
  },
];

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  fontSize: "12px",
};

const getLogTone = (status: DemoLog["status"]) => {
  if (status === "success") return "bg-success";
  if (status === "warning") return "bg-warning";
  if (status === "error") return "bg-destructive";
  return "bg-primary";
};

export default function Demo() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedBotId, setSelectedBotId] = useState(demoBots[0]?.id || "");
  const activeBot = demoBots.find((bot) => bot.id === selectedBotId) ?? demoBots[0];

  if (!activeBot) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h2 className="font-display text-3xl font-black tracking-tight">{t("demo.noBotsTitle")}</h2>
        <p className="mt-2 max-w-md text-muted-foreground">{t("demo.noBotsDesc")}</p>
      </div>
    );
  }

  const getStatusLabel = (status: string) => {
    if (status === "Active") return t("status.active");
    if (status === "Offline") return t("status.offline");
    if (status === "Error") return t("status.error");
    return status;
  };

  const metrics = [
    { label: t("metric.distanceTraveled"), value: activeBot.distance.toString(), unit: t("unit.meters"), sub: t("metric.totalDistance", { botId: activeBot.id }), icon: Route },
    { label: t("metric.areaCovered"), value: activeBot.area.toString(), unit: t("unit.acres"), sub: t("metric.fieldCoverage"), icon: MapPinned },
    { label: t("metric.pesticideSprayed"), value: activeBot.pesticide.toFixed(2), unit: t("unit.liters"), sub: t("metric.measuredTankOutput"), icon: SprayCan },
    { label: t("metric.operatingTime"), value: activeBot.time, unit: "", sub: t("metric.recordedActiveDuration"), icon: Clock3 },
  ];

  const statusTone = activeBot.status === "Error" ? "bg-destructive" : activeBot.status === "Active" ? "bg-success" : "bg-muted-foreground";

  const handleStartDiscovery = () => {
    navigate("/connect-bot");
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-[2rem] border bg-gradient-surface p-6 shadow-lg lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow animate-float">
              <Tractor className="h-6 w-6 text-primary-foreground" />
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="w-fit border-primary/30 bg-primary/10 text-[10px] font-bold uppercase tracking-wider text-primary">
                  {t("dashboard.liveMonitoring")}
                </Badge>
                <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground border-none">
                  {t("status.readOnly")}
                </Badge>
              </div>
              <h1 className="font-display text-2xl font-extrabold sm:text-3xl">{t("dashboard.botInsights")}</h1>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 rounded-2xl border bg-card px-4 py-3 text-sm font-bold shadow-sm">
            <span className={`pulse-dot ${statusTone}`} />
            {activeBot.id}: {getStatusLabel(activeBot.status)}
          </div>
          <Button
            onClick={handleStartDiscovery}
            variant="outline"
            className="h-10 rounded-xl border-primary/20 bg-primary/5 font-bold text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("button.connectMore")}
          </Button>
          <Button
            onClick={() => {
              toast.info(t("demo.demoMode"), {
                description: t("demo.demoModeDesc"),
              });
            }}
            variant="outline"
            className="h-10 rounded-xl border-destructive/20 bg-destructive/5 font-bold text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <WifiOff className="mr-2 h-4 w-4" />
            {t("button.disconnect")}
          </Button>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t("demo.demoBots")}</p>
        <div className="flex flex-wrap gap-2">
          {demoBots.map((bot) => (
            <button
              key={bot.id}
              onClick={() => setSelectedBotId(bot.id)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                bot.id === activeBot.id
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
              }`}
            >
              {bot.id}
            </button>
          ))}
        </div>
      </div>

      {activeBot.alerts.length > 0 && (
        <section className="animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex flex-col gap-2">
            {activeBot.alerts.map((alert, i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm font-medium text-destructive backdrop-blur-md">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                {alert.startsWith("alerts.") ? t(alert) : alert}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={metric.label} className="premium-card animate-scale-in" style={{ animationDelay: `${index * 55}ms` }}>
            <div className="absolute inset-0 bg-gradient-glow opacity-40" />
            <div className="relative flex flex-col justify-between h-full gap-4">
              <div className="flex items-center justify-between">
                <span className="stat-label">{metric.label}</span>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <metric.icon className="h-5 w-5 text-primary" />
                </span>
              </div>
              <div>
                <p className="font-display text-3xl font-extrabold tracking-tighter">
                  {metric.value} <span className="text-sm font-bold text-muted-foreground">{metric.unit}</span>
                </p>
                <p className="mt-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{metric.sub}</p>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="premium-card lg:col-span-1">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold">{t("dashboard.botStatus")}</h2>
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between rounded-2xl bg-secondary/70 p-4">
              <span className="text-xs font-bold uppercase tracking-tight">{t("dashboard.currentState")}</span>
              <Badge className={activeBot.status === "Error" ? "bg-destructive text-destructive-foreground" : activeBot.status === "Active" ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}>
                {getStatusLabel(activeBot.status)}
              </Badge>
            </div>
            <StatusMeter label={t("dashboard.batteryLevel")} value={activeBot.battery} icon={BatteryCharging} />
            <StatusMeter label={t("dashboard.tankLevel")} value={activeBot.tank} icon={Droplets} />
          </div>
        </Card>

        <Card className="premium-card lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold">{t("dashboard.liveProgress")}</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t("dashboard.distanceTrend")}</p>
            </div>
            <Route className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-6 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeBot.distanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="distance" name="Distance (m)" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-1">
        <Card className="premium-card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold">{t("dashboard.resourceAllocation")}</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">{t("dashboard.litersPerSession")}</p>
            </div>
            <SprayCan className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-6 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeBot.pesticideTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="liters" name="Pesticide (L)" fill="hsl(var(--accent))" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      <Card className="rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-bold">{t("dashboard.activityLogs")}</h2>
          <Badge variant="outline" className="border-primary/30 text-primary">{t("dashboard.latestRecords")}</Badge>
        </div>
        {activeBot.logs.length === 0 ? (
          <div className="mt-4 flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-2xl bg-muted/5">
            <Clock3 className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
            <p className="text-sm font-bold text-muted-foreground">{t("dashboard.noLogsTitle", { botId: activeBot.id })}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("dashboard.noLogsDesc")}</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {activeBot.logs.map((log) => (
              <div key={`${log.ts}-${log.event}`} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/10 p-4">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${getLogTone(log.status)}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{log.event}</p>
                    <span className="text-[10px] text-muted-foreground">{log.ts}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{log.detail}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function StatusMeter({ label, value, icon: Icon }: { label: string; value: number; icon: typeof BatteryCharging }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-semibold">
          <Icon className="h-4 w-4 text-primary" /> {label}
        </span>
        <span className="font-mono text-muted-foreground">{value}%</span>
      </div>
      <Progress value={value} className="h-3" />
    </div>
  );
}
