import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useBotSimulator } from "@/hooks/useBotSimulator";
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
import { useThingSpeak, asNumber } from "@/context/ThingSpeakContext";
import { monitoredDevices, monitoredDeviceList, type DeviceKey } from "@/lib/monitoring-devices";

const activityLogs = monitoredDeviceList.map((device, index) => ({
  time: ["Today, 12:10 PM", "Today, 11:45 AM", "Today, 10:30 AM", "Today, 09:55 AM"][index],
  device: device.id,
  distance: `${device.distance} m`,
  pesticide: `${device.pesticide} L`,
  status: device.state,
}));

const formatArea = (acres: number | string) => {
  const val = Number(acres);
  if (val >= 1) return { value: val.toFixed(1), unit: "acres" };
  return { value: Math.round(val * 4046.86).toString(), unit: "sq m" };
};

const formatTime = (hours: number | string) => {
  const totalSeconds = Math.floor(Number(hours) * 3600);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return { value: `${h}h ${m}m ${s}s`, unit: "" };
};

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  fontSize: "12px",
};

export default function Dashboard() {
  const { latest, status, isDemoMode } = useThingSpeak();
  const navigate = useNavigate();
  const [selectedDevice, setSelectedDevice] = useState<DeviceKey>("device1");
  const device = monitoredDevices[selectedDevice];
  
  const simulatedBot = useBotSimulator(device.id, {
    distance: Number(device.distance),
    area: Number(device.area),
    pesticide: Number(device.pesticide),
    time: Number(device.time),
    battery: device.battery,
    tank: device.tank,
    status: device.state as any
  }, device.state === "Active");

  const liveData = {
    distance: simulatedBot.distance.toString(),
    area: simulatedBot.area.toString(),
    pesticide: simulatedBot.pesticide.toString(),
    time: simulatedBot.time.toString(),
    completion: simulatedBot.completion.toString(),
    battery: simulatedBot.battery,
    tank: latest && selectedDevice === "device1" ? asNumber(latest.field1) : simulatedBot.tank,
    status: status === "error" ? "Error" : simulatedBot.status,
    alerts: simulatedBot.alerts,
  };

  const hasDevices = monitoredDeviceList.length > 0;

  const fieldCells = Array.from({ length: 64 }, (_, index) => index < Math.round(Number(liveData.completion) * 0.64));

  const metrics = [
    { label: "Distance Traveled", value: liveData.distance, unit: "meters", sub: `${device.id} total distance`, icon: Route },
    { label: "Area Covered", ...formatArea(liveData.area), sub: `Field coverage`, icon: MapPinned },
    { label: "Pesticide Sprayed", value: Number(liveData.pesticide).toFixed(2), unit: "liters", sub: "Measured tank output", icon: SprayCan },
    { label: "Operating Time", ...formatTime(liveData.time), sub: "Recorded active duration", icon: Clock3 },
  ];

  if (!hasDevices) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-primary/10 text-primary animate-pulse">
          <Plus className="h-12 w-12" />
        </div>
        <h2 className="font-display text-3xl font-black tracking-tight">No Devices Connected</h2>
        <p className="mt-2 max-w-md text-muted-foreground">Start by connecting your first pesticide spraying bot to monitor its live telemetry and field performance.</p>
        <Button onClick={() => navigate("/devices")} size="lg" className="mt-8 h-14 rounded-2xl px-8 text-lg font-bold shadow-glow transition-all hover:scale-105 active:scale-95">
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
          <Select value={selectedDevice} onValueChange={(value) => setSelectedDevice(value as DeviceKey)}>
            <SelectTrigger className="h-12 w-full rounded-xl sm:w-48">
              <SelectValue placeholder="Monitoring Device" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(monitoredDevices).map(([key, item]) => (
                <SelectItem key={key} value={key}>{item.name} · {item.id}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 rounded-2xl border bg-card px-4 py-3 text-sm font-bold shadow-sm">
            <span className={liveData.status === "Error" ? "pulse-dot bg-destructive" : liveData.status === "Active" ? "pulse-dot bg-success" : "pulse-dot bg-muted-foreground"} />
            {device.id}: {liveData.status}
          </div>
          <Button onClick={() => navigate("/devices")} className="h-12 rounded-xl bg-primary shadow-glow hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Connect More
          </Button>
        </div>
      </section>

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
          <div className="mt-6 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={device.distanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="distance" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "hsl(var(--background))" }} />
              </LineChart>
            </ResponsiveContainer>
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
          <div className="mt-6 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={device.pesticideData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="session" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={tooltipStyle} 
                  formatter={(value, name, props) => {
                    if (name === "liters") return [`${value} L`, "Amount"];
                    return [value, name];
                  }}
                  labelFormatter={(label, payload) => {
                    const item = payload[0]?.payload;
                    return item ? `Session ${label}: Sprayed in ${item.duration} mins` : `Session ${label}`;
                  }}
                />
                <Bar dataKey="liters" name="liters" fill="hsl(var(--accent))" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      <Card className="rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-bold">Activity Logs</h2>
          <Badge variant="outline" className="border-primary/30 text-primary">Latest monitoring records</Badge>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-3 pr-4 font-semibold">Time</th>
                <th className="py-3 pr-4 font-semibold">Device ID</th>
                <th className="py-3 pr-4 font-semibold">Distance</th>
                <th className="py-3 pr-4 font-semibold">Pesticide Used</th>
                <th className="py-3 pr-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {activityLogs.map((log) => (
                <tr key={`${log.time}-${log.device}`}>
                  <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">{log.time}</td>
                  <td className="py-3 pr-4 font-semibold">{log.device}</td>
                  <td className="py-3 pr-4 font-semibold">{log.distance}</td>
                  <td className="py-3 pr-4">{log.pesticide}</td>
                  <td className="py-3 pr-4">
                    <Badge variant="outline" className={log.status === "Active" ? "border-success/30 bg-success/10 text-success" : "border-muted-foreground/30 bg-muted text-muted-foreground"}>{log.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
