import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BatteryCharging, CheckCircle2, Clock3, Droplets, MapPinned, Route, SprayCan } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const distanceData = [
  { time: "08:00", distance: 0.2 },
  { time: "08:30", distance: 0.8 },
  { time: "09:00", distance: 1.3 },
  { time: "09:30", distance: 1.9 },
  { time: "10:00", distance: 2.4 },
];

const pesticideData = [
  { session: "Pass 1", liters: 0.8 },
  { session: "Pass 2", liters: 1.1 },
  { session: "Pass 3", liters: 0.7 },
  { session: "Pass 4", liters: 0.6 },
];

const taskData = [
  { name: "Completed", value: 55, color: "hsl(var(--primary))" },
  { name: "In Progress", value: 30, color: "hsl(var(--accent))" },
  { name: "Pending", value: 15, color: "hsl(var(--warning))" },
];

const metrics = [
  { label: "Distance Traveled", value: "2.4", unit: "km", icon: Route },
  { label: "Area Covered", value: "1.1", unit: "hectares", icon: MapPinned },
  { label: "Pesticide Sprayed", value: "3.2", unit: "liters", icon: SprayCan },
  { label: "Operating Time", value: "2", unit: "hours", icon: Clock3 },
  { label: "Task Status", value: "In Progress", unit: "", icon: CheckCircle2 },
];

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  fontSize: "12px",
};

export default function Demo() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-gradient-surface p-5">
        <Badge variant="outline" className="mb-2 border-accent/30 bg-accent/10 text-accent">Demo / Sample Data View</Badge>
        <h1 className="font-display text-2xl font-extrabold">Sample Bot Monitoring Data</h1>
        <p className="mt-1 text-sm text-muted-foreground">Preview the analytics that appear when a pesticide spraying bot is connected.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => (
          <Card key={metric.label} className="stat-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{metric.label}</p>
                <p className="mt-2 font-display text-2xl font-extrabold">
                  {metric.value} {metric.unit && <span className="text-sm font-semibold text-muted-foreground">{metric.unit}</span>}
                </p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <metric.icon className="h-5 w-5 text-primary" />
              </span>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {[
          { label: "Battery Level", value: 78, icon: BatteryCharging },
          { label: "Tank Level", value: 64, icon: Droplets },
        ].map((item) => (
          <Card key={item.label} className="rounded-2xl p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2 font-semibold"><item.icon className="h-4 w-4 text-primary" /> {item.label}</span>
              <span className="font-mono text-sm text-muted-foreground">{item.value}%</span>
            </div>
            <Progress value={item.value} className="h-3" />
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl p-5 lg:col-span-2">
          <h2 className="font-display text-base font-bold">Distance over Time</h2>
          <div className="mt-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={distanceData}>
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
          <h2 className="font-display text-base font-bold">Task Completion</h2>
          <div className="mt-4 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={taskData} innerRadius={54} outerRadius={78} dataKey="value" paddingAngle={4}>
                  {taskData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="rounded-2xl p-5 lg:col-span-3">
          <h2 className="font-display text-base font-bold">Pesticide Usage</h2>
          <div className="mt-4 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pesticideData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="session" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="liters" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>
    </div>
  );
}
