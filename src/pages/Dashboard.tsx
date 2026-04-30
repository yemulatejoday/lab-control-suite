import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  BatteryCharging,
  CheckCircle2,
  Clock3,
  Droplets,
  Leaf,
  MapPinned,
  Route,
  SprayCan,
  Tractor,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
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
  time: ["12:10 PM", "11:45 AM", "10:30 AM", "09:55 AM"][index],
  device: device.id,
  distance: `${device.distance} km`,
  pesticide: `${device.pesticide} L`,
  status: device.state,
}));

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  fontSize: "12px",
};

export default function Dashboard() {
  const { latest, status } = useThingSpeak();
  const [selectedDevice, setSelectedDevice] = useState<DeviceKey>("device1");
  const device = monitoredDevices[selectedDevice];
  const tank = latest && selectedDevice === "device1" ? asNumber(latest.field1) : device.tank;
  const botStatus = status === "error" ? "Error" : device.state;
  const fieldCells = Array.from({ length: 64 }, (_, index) => index < Math.round(Number(device.completion) * 0.64));

  const metrics = [
    { label: "Distance Traveled", value: device.distance, unit: "km", sub: `${device.id} total distance`, icon: Route },
    { label: "Area Covered", value: device.area, unit: "hectares", sub: `${device.completion}% of assigned plot`, icon: MapPinned },
    { label: "Pesticide Sprayed", value: device.pesticide, unit: "liters", sub: "Measured tank output", icon: SprayCan },
    { label: "Operating Time", value: device.time, unit: "hours", sub: "Recorded active duration", icon: Clock3 },
    { label: "Task Status", value: device.completion, unit: "%", sub: botStatus === "Offline" ? "Last known completion" : "Current task completion", icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-2xl border bg-gradient-surface p-5 shadow-md-soft lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <Tractor className="h-5 w-5 text-primary-foreground" />
            </span>
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
              Monitoring Only – Read-Only Bot Analytics
            </Badge>
          </div>
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Pesticide Spraying Bot Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Real-Time Monitoring and Data Analytics</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="text-sm font-semibold text-muted-foreground">Select Device:</label>
          <Select value={selectedDevice} onValueChange={(value) => setSelectedDevice(value as DeviceKey)}>
            <SelectTrigger className="h-11 w-full sm:w-48">
              <SelectValue placeholder="Select Device" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(monitoredDevices).map(([key, item]) => (
                <SelectItem key={key} value={key}>{item.name} · {item.id}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2 text-sm font-semibold">
            <span className={botStatus === "Error" ? "pulse-dot bg-destructive" : botStatus === "Active" ? "pulse-dot bg-success" : "pulse-dot bg-muted-foreground"} />
            {device.id}: {botStatus}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric, index) => (
          <Card key={metric.label} className="stat-card animate-scale-in" style={{ animationDelay: `${index * 55}ms` }}>
            <div className="absolute inset-0 bg-gradient-glow opacity-60" />
            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{metric.label}</p>
                <p className="mt-2 font-display text-3xl font-extrabold tracking-tight">
                  {metric.value} <span className="text-sm font-semibold text-muted-foreground">{metric.unit}</span>
                </p>
                <p className="mt-2 text-xs font-medium text-muted-foreground">{metric.sub}</p>
              </div>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <metric.icon className="h-5 w-5 text-primary" />
              </span>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        <Card className="rounded-2xl p-5 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold">Bot Status</h2>
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-5 space-y-5">
            <div className="flex items-center justify-between rounded-xl bg-secondary/70 p-3">
              <span className="text-sm font-semibold">Current State</span>
              <Badge className={botStatus === "Error" ? "bg-destructive text-destructive-foreground" : botStatus === "Active" ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}>
                {botStatus}
              </Badge>
            </div>
            <StatusMeter label="Battery Level" value={device.battery} icon={BatteryCharging} />
            <StatusMeter label="Pesticide Tank Level" value={tank} icon={Droplets} />
          </div>
        </Card>

        <Card className="rounded-2xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold">Distance vs Time</h2>
              <p className="text-xs text-muted-foreground">Kilometers traveled by {device.id}</p>
            </div>
            <Route className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={device.distanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="distance" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 3, fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold">Task Status</h2>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-3 h-[210px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={device.taskStatusData} innerRadius={52} outerRadius={78} paddingAngle={4} dataKey="value">
                  {device.taskStatusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {device.taskStatusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} /> {item.name}
                </span>
                <span className="font-mono font-semibold">{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold">Pesticide Usage per Session</h2>
              <p className="text-xs text-muted-foreground">Liters sprayed in each completed field pass</p>
            </div>
            <SprayCan className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={device.pesticideData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="session" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="liters" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold">Field Coverage</h2>
              <p className="text-xs text-muted-foreground">Covered vs uncovered field area</p>
            </div>
            <Leaf className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-5 grid grid-cols-8 gap-1 rounded-2xl border bg-secondary/50 p-3">
            {fieldCells.map((covered, index) => (
              <span key={index} className={covered ? "aspect-square rounded-md bg-primary/70 shadow-sm" : "aspect-square rounded-md bg-muted"} />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-primary/10 p-3">
              <p className="font-semibold text-primary">Covered</p>
              <p className="mt-1 font-mono text-lg font-bold">{device.area} ha</p>
            </div>
            <div className="rounded-xl bg-muted p-3">
              <p className="font-semibold text-muted-foreground">Uncovered</p>
              <p className="mt-1 font-mono text-lg font-bold">{device.uncovered} ha</p>
            </div>
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
