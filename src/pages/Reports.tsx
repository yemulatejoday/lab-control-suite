import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { BarChart3, CalendarDays, Download, Droplets, MapPinned, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/config";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useLanguage } from "@/context/LanguageContext";

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  fontSize: "12px",
};

const formatTimeLabel = (timestamp?: string) => {
  if (!timestamp) return "";
  if (timestamp.includes("T")) return timestamp.split("T")[1]?.slice(0, 5) || timestamp;
  const parts = timestamp.split(" ");
  return parts[1]?.slice(0, 5) || timestamp;
};

const formatDateLabel = (timestamp?: string) => {
  if (!timestamp) return "";
  if (timestamp.includes("T")) return timestamp.split("T")[0] || timestamp;
  return timestamp.split(" ")[0] || timestamp;
};

export default function Reports() {
  const { activeBotId } = useAuth();
  const { t } = useLanguage();
  const [reportData, setReportData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!activeBotId) return;
    
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("agri_token");
        const res = await fetch(`${API_URL}/api/reports/${activeBotId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setReportData(data);
      } catch (e) {
        toast.error(t("reports.fetchError"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [activeBotId]);

  if (!activeBotId || reportData.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-primary/10 text-primary">
          <BarChart3 className="h-12 w-12" />
        </div>
        <h2 className="font-display text-3xl font-black tracking-tight">{t("reports.noReportsTitle")}</h2>
        <p className="mt-2 max-w-md text-muted-foreground">{t("reports.noReportsDesc")}</p>
      </div>
    );
  }

  // Aggregate stats from reportData
  const totalDistance = reportData.reduce((acc, cur) => acc + cur.distance, 0);
  const totalArea = reportData.reduce((acc, cur) => acc + cur.area, 0);
  const totalPesticide = reportData.reduce((acc, cur) => acc + cur.pesticide, 0);
  
  const summaries = [
    { label: t("reports.totalDistance"), value: totalDistance.toFixed(0), unit: t("unit.meters"), icon: Route },
    { label: t("reports.totalArea"), value: totalArea.toFixed(2), unit: t("unit.acres"), icon: MapPinned },
    { label: t("reports.pesticideUsed"), value: totalPesticide.toFixed(2), unit: t("unit.liters"), icon: Droplets },
    { label: t("reports.lastActive"), value: formatDateLabel(reportData[0]?.timestamp), unit: "", icon: CalendarDays },
  ];

  const chartData = [...reportData].reverse().map(log => ({
    time: formatTimeLabel(log.timestamp),
    distance: log.distance,
    pesticide: log.pesticide,
    area: log.area
  }));

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-[2rem] border bg-gradient-surface p-6 lg:flex-row lg:items-center lg:justify-between shadow-sm">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary">{t("reports.performanceReports")}</Badge>
            <Badge
              variant="secondary"
              className={`text-[10px] font-bold uppercase tracking-widest ${
                activeBotId ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground border-none"
              }`}
            >
              {activeBotId ? t("reports.connected") : t("reports.disconnected")}
            </Badge>
          </div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">{t("reports.operationAnalytics")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("reports.operationDesc")}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Badge variant="outline" className="h-12 px-6 rounded-xl border-primary/30 text-primary font-bold">
            {t("reports.connectedBot", { botId: activeBotId || t("common.none") })}
          </Badge>
          <Button onClick={() => toast.info(t("reports.exportSoon"))} variant="outline" className="h-12 rounded-xl border-dashed">
            <Download className="mr-2 h-4 w-4" /> {t("button.exportAnalytics")}
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaries.map((item, idx) => (
          <Card key={item.label} className="premium-card animate-scale-in" style={{ animationDelay: `${idx * 75}ms` }}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <item.icon className="h-5 w-5 text-primary" />
            </span>
            <p className="mt-4 stat-label">{item.label}</p>
            <p className="mt-2 font-display text-2xl font-extrabold tracking-tight">{item.value} {item.unit}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="premium-card">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold">{t("reports.historicalPerformance")}</h2>
            <Route className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-6 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="distance" name="Distance (m)" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "hsl(var(--background))" }} />
                <Line type="monotone" dataKey="area" name="Area (acres)" stroke="hsl(var(--accent))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--accent))", strokeWidth: 2, stroke: "hsl(var(--background))" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="premium-card">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold">{t("reports.resourceUtilization")}</h2>
            <Droplets className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-6 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="pesticide" name="Pesticide (L)" fill="hsl(var(--accent))" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      <Card className="premium-card">
        <div className="flex items-center gap-2 font-display font-bold"><BarChart3 className="h-4 w-4 text-primary" /> {t("reports.performanceInsights")}</div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.5rem] border bg-secondary/30 p-5 text-sm font-medium leading-relaxed text-muted-foreground">
            {t("reports.insightData", { botId: activeBotId || t("common.none") })}
          </div>
          <div className="rounded-[1.5rem] border bg-secondary/30 p-5 text-sm font-medium leading-relaxed text-muted-foreground">
            {t("reports.insightEfficiency", { percent: ((totalPesticide / (totalArea || 1)) * 10).toFixed(1) })}
          </div>
        </div>
      </Card>
    </div>
  );
}
