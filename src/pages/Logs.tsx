import { useState, useEffect } from "react";
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
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/config";

const styles: Record<string, string> = {
  info: "border-primary/30 bg-primary/10 text-primary",
  success: "border-success/30 bg-success/10 text-success",
  warn: "border-warning/30 bg-warning/10 text-warning",
  error: "border-destructive/30 bg-destructive/10 text-destructive",
};

export default function Logs() {
  const { activeBotId } = useAuth();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!activeBotId) {
      setLogs([]);
      return;
    }

    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("agri_token");
        const res = await fetch(`${API_URL}/api/reports/${activeBotId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const rows = Array.isArray(data) ? data : [];
        const mapped = rows.map((entry: any) => {
          const status = entry.status === "Error" ? "error" : entry.battery < 20 || entry.tank < 20 ? "warn" : "info";
          const event = entry.status === "Error"
            ? "Device Alert"
            : entry.battery < 20
            ? "Battery Warning"
            : entry.tank < 20
            ? "Tank Warning"
            : "Telemetry Update";
          const detailParts = [] as string[];
          if (typeof entry.distance === "number") detailParts.push(`Distance ${entry.distance.toFixed(2)} m`);
          if (typeof entry.area === "number") detailParts.push(`Area ${entry.area.toFixed(2)} acres`);
          if (typeof entry.tank === "number") detailParts.push(`Tank ${entry.tank}%`);
          if (typeof entry.battery === "number") detailParts.push(`Battery ${entry.battery}%`);
          return {
            ts: entry.timestamp,
            event,
            detail: detailParts.join(" · ") || "Telemetry received",
            status,
          };
        });
        setLogs(mapped);
      } catch (e) {
        toast.error("Failed to fetch monitoring logs");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [activeBotId]);

  const filtered = logs.filter((log) => {
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
                  {isLoading ? "Loading logs..." : activeBotId ? "No monitoring logs available." : "Connect a device to view logs."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
