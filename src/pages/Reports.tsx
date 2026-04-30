import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart3, CalendarDays, Clock3, Download, Droplets, MapPinned, Route, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { monitoredDevices, type DeviceKey } from "@/lib/monitoring-devices";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const formatArea = (acres: number | string) => {
  const val = typeof acres === "string" ? parseFloat(acres) : acres;
  if (isNaN(val)) return { value: acres, unit: "" };
  if (val >= 1) return { value: val.toFixed(1), unit: "acres" };
  return { value: Math.round(val * 4046.86).toString(), unit: "sq meters" };
};

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  fontSize: "12px",
};

export default function Reports() {
  const offlineDeviceList = Object.entries(monitoredDevices).filter(([_, d]) => d.state !== "Active") as [DeviceKey, any][];
  const [selectedDevice, setSelectedDevice] = useState<DeviceKey>(offlineDeviceList[0]?.[0] || "device3");
  
  const device = monitoredDevices[selectedDevice];
  const report = device?.report;
  
  if (!device || !report) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h2 className="text-xl font-bold">No Completed Reports</h2>
        <p className="text-muted-foreground">All devices are currently active in the field.</p>
      </div>
    );
  }
  
  const handleExport = () => {
    toast.success("Report Exported", {
      description: `Analytics for ${device.id} have been saved as PDF.`,
    });
  };

  const summaries = [
    { label: "Total Distance", value: report.distance, unit: "meters", icon: Route },
    { label: "Total Area", ...formatArea(report.area), icon: MapPinned },
    { label: "Pesticide Used", value: report.pesticide, unit: "liters", icon: Droplets },
    { label: "Operated Time", value: report.time, unit: "hours", icon: Clock3 },
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-[2rem] border bg-gradient-surface p-6 lg:flex-row lg:items-center lg:justify-between shadow-sm">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary">Performance Reports</Badge>
            <Badge variant="secondary" className={`text-[10px] font-bold uppercase tracking-widest ${device.state === "Active" ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground border-none"}`}>
              {device.state === "Active" ? "Connected" : "Disconnected"}
            </Badge>
          </div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Operation Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Historical performance data and resource efficiency metrics.</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {offlineDeviceList.map(([key, d]) => (
              <button
                key={key}
                onClick={() => setSelectedDevice(key as DeviceKey)}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                  selectedDevice === key
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                }`}
              >
                {d.id}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select value={selectedDevice} onValueChange={(value) => setSelectedDevice(value as DeviceKey)}>
            <SelectTrigger className="h-12 w-full sm:w-60 rounded-xl">
              <SelectValue placeholder="View Report for" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Past Devices (Offline)</SelectLabel>
                {Object.entries(monitoredDevices)
                  .filter(([_, item]) => item.state === "Offline")
                  .map(([key, item]) => (
                    <SelectItem key={key} value={key}>{item.name} · {item.id}</SelectItem>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} variant="outline" className="h-12 rounded-xl border-dashed">
            <Download className="mr-2 h-4 w-4" /> Export Data
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
            <h2 className="font-display text-base font-bold">Historical Performance</h2>
            <Route className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-6 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={report.history}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="distance" name="Distance (meters)" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "hsl(var(--background))" }} />
                <Line type="monotone" dataKey="time" name="Operated Time (hours)" stroke="hsl(var(--warning))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--warning))", strokeWidth: 2, stroke: "hsl(var(--background))" }} />
                <Line type="monotone" dataKey="area" name="Area (acres)" stroke="hsl(var(--accent))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--accent))", strokeWidth: 2, stroke: "hsl(var(--background))" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="premium-card">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold">Resource Utilization</h2>
            <Droplets className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-6 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.usage}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="liters" name="Pesticide (L)" fill="hsl(var(--accent))" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      <Card className="premium-card">
        <div className="flex items-center gap-2 font-display font-bold"><BarChart3 className="h-4 w-4 text-primary" /> AI-Generated Insights</div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {report.insights.map((item) => (
            <div key={item} className="rounded-[1.5rem] border bg-secondary/30 p-5 text-sm font-medium leading-relaxed text-muted-foreground hover:bg-secondary/50 transition-colors">{item}</div>
          ))}
        </div>
      </Card>
    </div>
  );
}
