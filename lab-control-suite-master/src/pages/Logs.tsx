import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Search } from "lucide-react";
import { toast } from "sonner";

const monitoringLogs = [
  { ts: "2025-04-24 14:32:11", event: "Telemetry Update", detail: "BOT-AG-102 reported tank level at 48%", status: "success" },
  { ts: "2025-04-24 14:30:48", event: "Task Progress", detail: "BOT-AG-118 reached 61% field completion", status: "info" },
  { ts: "2025-04-24 14:28:02", event: "Distance Reading", detail: "BOT-AG-102 total distance recorded at 9.8 km", status: "info" },
  { ts: "2025-04-24 14:24:30", event: "Device Sync", detail: "ESP32 telemetry feed received for BOT-AG-131", status: "success" },
  { ts: "2025-04-24 14:22:39", event: "Tank Warning", detail: "BOT-AG-125 tank level dropped below 50%", status: "warn" },
  { ts: "2025-04-24 14:11:50", event: "Device Alert", detail: "BOT-AG-125 has not reported new telemetry", status: "error" },
  { ts: "2025-04-24 14:05:21", event: "API Read", detail: "ThingSpeak feed polled for monitoring data", status: "info" },
  { ts: "2025-04-24 13:58:09", event: "Tank Critical", detail: "BOT-AG-118 tank level below 25%", status: "error" },
  { ts: "2025-04-24 13:40:17", event: "System", detail: "Read-only monitoring channel connected", status: "success" },
];

const styles: Record<string, string> = {
  info: "border-primary/30 bg-primary/10 text-primary",
  success: "border-success/30 bg-success/10 text-success",
  warn: "border-warning/30 bg-warning/10 text-warning",
  error: "border-destructive/30 bg-destructive/10 text-destructive",
};

export default function Logs() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");

  const filtered = monitoringLogs.filter((log) => {
    const q = query.toLowerCase();
    const matchQ = log.event.toLowerCase().includes(q) || log.detail.toLowerCase().includes(q);
    const matchT = type === "all" || log.event.toLowerCase().includes(type);
    return matchQ && matchT;
  });

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search monitoring logs…" className="h-10 pl-9" />
          </div>

          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="h-10 w-full lg:w-44">
              <SelectValue placeholder="Event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All events</SelectItem>
              <SelectItem value="telemetry">Telemetry</SelectItem>
              <SelectItem value="task">Task</SelectItem>
              <SelectItem value="tank">Tank</SelectItem>
              <SelectItem value="device">Device</SelectItem>
            </SelectContent>
          </Select>

          <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90" onClick={() => toast.success("Monitoring logs exported as CSV")}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden rounded-2xl">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead className="w-[180px]">Event</TableHead>
              <TableHead>Detail</TableHead>
              <TableHead className="w-[110px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((log, index) => (
              <TableRow key={`${log.ts}-${log.event}`} className="animate-fade-in" style={{ animationDelay: `${index * 25}ms` }}>
                <TableCell className="font-mono text-xs text-muted-foreground">{log.ts}</TableCell>
                <TableCell className="font-semibold">{log.event}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{log.detail}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`${styles[log.status]} capitalize`}>
                    {log.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-12 text-center text-sm text-muted-foreground">
                  No monitoring logs available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
