import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  AlertTriangle,
  BatteryCharging,
  CheckCircle2,
  Clock3,
  Droplets,
  Leaf,
  MapPinned,
  Play,
  Plus,
  Route,
  SprayCan,
  StopCircle,
  Tractor,
  Wifi,
  WifiOff,
  Search,
  Cpu,
  AlertCircle,
  Loader2,
  SignalHigh,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useBotSimulator } from "@/hooks/useBotSimulator";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/config";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  fontSize: "12px",
};

const initialLiveData = {
  distance: "0",
  area: "0",
  pesticide: "0.00",
  time: "0.0",
  battery: 100,
  tank: 100,
  status: "Offline",
  completion: 0,
  alerts: [] as string[],
};

export default function Dashboard() {
  const { activeBotId, disconnectBot, connectBot } = useAuth();
  const navigate = useNavigate();
  const [liveData, setLiveData] = useState<any>(initialLiveData);
  const [bots, setBots] = useState<any[]>([]);
  const [isBotsLoading, setIsBotsLoading] = useState(false);

  const fetchBots = async () => {
    setIsBotsLoading(true);
    try {
      const token = localStorage.getItem("agri_token");
      const res = await fetch(`${API_URL}/api/bots`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBots(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Failed to fetch connected devices");
    } finally {
      setIsBotsLoading(false);
    }
  };

  const fetchTelemetry = async () => {
    if (!activeBotId) return;
    try {
      const token = localStorage.getItem("agri_token");
      const res = await fetch(`${API_URL}/api/telemetry/${activeBotId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Telemetry request failed");
      const data = await res.json();
      if (data && data.status) {
        setLiveData({
          distance: data.distance.toString(),
          area: data.area.toString(),
          pesticide: data.pesticide.toFixed(2),
          time: "1.2", // Mock duration for now
          battery: data.battery,
          tank: data.tank,
          status: data.status,
          completion: Math.min(100, data.area * 10),
          alerts: data.battery < 20 ? ["Low Battery Warning"] : [],
        });
      } else {
        setLiveData((prev: any) => ({
          ...prev,
          status: "Connected",
          alerts: [],
        }));
      }
    } catch (e) {
      console.error("Failed to fetch telemetry", e);
      setLiveData((prev: any) => ({
        ...prev,
        status: "Offline",
      }));
    }
  };

  useEffect(() => {
    if (!activeBotId) return;
    setLiveData({ ...initialLiveData, status: "Connecting" });
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(interval);
  }, [activeBotId]);

  useEffect(() => {
    fetchBots();
  }, [activeBotId]);

  const handleStartDiscovery = () => {
    navigate("/connect-bot");
  };

  const hasDevices = bots.length > 0;
  const hasActiveDevice = activeBotId !== null;

  const metrics = [
    { label: "Distance Traveled", value: liveData.distance, unit: "meters", sub: `${activeBotId} total distance`, icon: Route },
    { label: "Area Covered", value: liveData.area, unit: "acres", sub: `Field coverage`, icon: MapPinned },
    { label: "Pesticide Sprayed", value: liveData.pesticide, unit: "liters", sub: "Measured tank output", icon: SprayCan },
    { label: "Operating Time", value: "1h 12m", unit: "", sub: "Recorded active duration", icon: Clock3 },
  ];

  if (!hasDevices && !isBotsLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h2 className="font-display text-3xl font-black tracking-tight">No Devices Connected</h2>
        <p className="mt-2 max-w-md text-muted-foreground">Start by connecting your first pesticide spraying bot to monitor its live telemetry and field performance.</p>
        <Button onClick={handleStartDiscovery} size="lg" className="mt-8 h-14 rounded-2xl px-8 text-lg font-bold shadow-glow transition-all hover:scale-105 active:scale-95">
          Connect a Device
        </Button>
      </div>
    );
  }

  if (!hasActiveDevice && hasDevices) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h2 className="font-display text-3xl font-black tracking-tight">Select a Connected Device</h2>
        <p className="mt-2 max-w-md text-muted-foreground">Choose a bot to view its live dashboard, or connect a new device.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {bots.map((bot) => (
            <Button
              key={bot.id}
              variant="outline"
              className="rounded-xl px-6 font-bold"
              onClick={() => connectBot(bot.id)}
            >
              {bot.name || bot.id}
            </Button>
          ))}
        </div>
        <Button onClick={handleStartDiscovery} size="lg" className="mt-8 h-14 rounded-2xl px-8 text-lg font-bold shadow-glow transition-all hover:scale-105 active:scale-95">
          Connect a Device
        </Button>
      </div>
    );
  }

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
                  Live Monitoring Dashboard
                </Badge>
                <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground border-none">
                  Read-Only
                </Badge>
              </div>
              <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Bot Monitoring Insights</h1>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 rounded-2xl border bg-card px-4 py-3 text-sm font-bold shadow-sm">
            <span className={liveData.status === "Error" ? "pulse-dot bg-destructive" : liveData.status === "Active" ? "pulse-dot bg-success" : "pulse-dot bg-muted-foreground"} />
            {activeBotId}: {liveData.status}
          </div>
          <Button 
            onClick={handleStartDiscovery}
            variant="outline" 
            className="h-10 rounded-xl border-primary/20 bg-primary/5 font-bold text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Plus className="mr-2 h-4 w-4" />
            Connect More
          </Button>
          <Button 
            onClick={() => {
              disconnectBot();
              toast.info("Device Disconnected", {
                description: "Real-time monitoring has been suspended."
              });
            }}
            variant="outline" 
            className="h-10 rounded-xl border-destructive/20 bg-destructive/5 font-bold text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <WifiOff className="mr-2 h-4 w-4" />
            Disconnect
          </Button>
        </div>
      </section>

      {hasDevices && (
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Connected Bots</p>
          <div className="flex flex-wrap gap-2">
            {bots.map((bot) => (
              <button
                key={bot.id}
                onClick={() => connectBot(bot.id)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  bot.id === activeBotId
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                }`}
              >
                {bot.id}
              </button>
            ))}
          </div>
        </div>
      )}

      {liveData.alerts.length > 0 && (
        <section className="animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex flex-col gap-2">
            {liveData.alerts.map((alert, i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm font-medium text-destructive backdrop-blur-md">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                {alert}
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
            <h2 className="font-display text-base font-bold">Bot Status</h2>
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between rounded-2xl bg-secondary/70 p-4">
              <span className="text-xs font-bold uppercase tracking-tight">Current State</span>
              <Badge className={liveData.status === "Error" ? "bg-destructive text-destructive-foreground" : liveData.status === "Active" ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}>
                {liveData.status}
              </Badge>
            </div>
            <StatusMeter label="Battery Level" value={liveData.battery} icon={BatteryCharging} />
            <StatusMeter label="Pesticide Tank Level" value={liveData.tank} icon={Droplets} />
          </div>
        </Card>

        <Card className="premium-card lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold">Live Progress</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Distance Traveled Trend (meters)</p>
            </div>
            <Route className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-6 flex h-[260px] items-center justify-center rounded-2xl border border-dashed text-center p-8 bg-muted/5">
            <div>
              <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Real-time Trend Chart</p>
              <p className="text-[10px] text-muted-foreground mt-1">Collecting path data from {activeBotId}...</p>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-1">
        <Card className="premium-card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold">Resource Allocation</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Liters sprayed per session time</p>
            </div>
            <SprayCan className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-6 flex h-[260px] items-center justify-center rounded-2xl border border-dashed text-center p-8 bg-muted/5">
            <div>
              <Droplets className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Resource Allocation Chart</p>
              <p className="text-[10px] text-muted-foreground mt-1">Measuring pesticide distribution efficiency...</p>
            </div>
          </div>
        </Card>
      </section>

      <Card className="rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-bold">Activity Logs</h2>
          <Badge variant="outline" className="border-primary/30 text-primary">Latest monitoring records</Badge>
        </div>
        <div className="mt-4 flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-2xl bg-muted/5">
          <Clock3 className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
          <p className="text-sm font-bold text-muted-foreground">No recent logs from {activeBotId}</p>
          <p className="text-xs text-muted-foreground mt-1">Logs will appear here once the bot starts its mission.</p>
        </div>
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
