import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart3, CalendarDays, CheckCircle2, Droplets, MapPinned, Route } from "lucide-react";
import { monitoredDevices, type DeviceKey } from "@/lib/monitoring-devices";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  fontSize: "12px",
};

export default function Reports() {
  const [selectedDevice, setSelectedDevice] = useState<DeviceKey>("device1");
  const device = monitoredDevices[selectedDevice];
  const report = device.report;
  const summaries = [
    { label: "Total Distance", value: report.distance, icon: Route },
    { label: "Total Area", value: report.area, icon: MapPinned },
    { label: "Pesticide Used", value: report.pesticide, icon: Droplets },
    { label: "Reporting Period", value: "7 days", icon: CalendarDays },
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-2xl border bg-gradient-surface p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Badge variant="outline" className="mb-2 border-primary/30 bg-primary/10 text-primary">Reports</Badge>
          <h1 className="font-display text-2xl font-extrabold">Monitoring Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">Device-specific performance summaries for pesticide spraying bots.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="text-sm font-semibold text-muted-foreground">View Report for:</label>
          <Select value={selectedDevice} onValueChange={(value) => setSelectedDevice(value as DeviceKey)}>
            <SelectTrigger className="h-11 w-full sm:w-52">
              <SelectValue placeholder="View Report for" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(monitoredDevices).map(([key, item]) => (
                <SelectItem key={key} value={key}>{item.name} · {item.id}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaries.map((item) => (
          <Card key={item.label} className="rounded-2xl p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <item.icon className="h-5 w-5 text-primary" />
            </span>
            <p className="mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">{item.label}</p>
            <p className="mt-2 font-display text-2xl font-extrabold">{item.value}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold">Historical Distance and Area</h2>
            <Route className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={report.history}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="distance" name="Distance (km)" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 3, fill: "hsl(var(--primary))" }} />
                <Line type="monotone" dataKey="area" name="Area (ha)" stroke="hsl(var(--accent))" strokeWidth={3} dot={{ r: 3, fill: "hsl(var(--accent))" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold">Task Completion Report</h2>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-4 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={device.taskStatusData} innerRadius={54} outerRadius={78} dataKey="value" paddingAngle={4}>
                  {device.taskStatusData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
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

        <Card className="rounded-2xl p-5 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold">Pesticide Usage Summary</h2>
            <Droplets className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.usage}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="liters" name="Pesticide (L)" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      <Card className="rounded-2xl p-5">
        <div className="flex items-center gap-2 font-display font-bold"><BarChart3 className="h-4 w-4 text-primary" /> Device Insights</div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {report.insights.map((item) => (
            <div key={item} className="rounded-xl border bg-secondary/40 p-4 text-sm text-muted-foreground">{item}</div>
          ))}
        </div>
      </Card>
    </div>
  );
}
