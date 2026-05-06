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
import { useLanguage } from "@/context/LanguageContext";

const styles: Record<string, string> = {
  info: "border-primary/30 bg-primary/10 text-primary",
  success: "border-success/30 bg-success/10 text-success",
  warn: "border-warning/30 bg-warning/10 text-warning",
  error: "border-destructive/30 bg-destructive/10 text-destructive",
};

export default function Logs() {
  const { activeBotId } = useAuth();
  const { t } = useLanguage();
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
          const isError = entry.status === "Error";
          const isBatteryWarn = typeof entry.battery === "number" && entry.battery < 20;
          const isTankWarn = typeof entry.tank === "number" && entry.tank < 20;
          const status = isError ? "error" : isBatteryWarn || isTankWarn ? "warn" : "info";
          const eventKey = isError
            ? "logs.deviceAlert"
            : isBatteryWarn
            ? "logs.batteryWarning"
            : isTankWarn
            ? "logs.tankWarning"
            : "logs.telemetryUpdate";
          const eventType = isError ? "device" : isTankWarn ? "tank" : isBatteryWarn ? "device" : "telemetry";
          const detailParts = [] as Array<{ key: string; value: string }>;
          if (typeof entry.distance === "number") detailParts.push({ key: "logs.detailDistance", value: entry.distance.toFixed(2) });
          if (typeof entry.area === "number") detailParts.push({ key: "logs.detailArea", value: entry.area.toFixed(2) });
          if (typeof entry.tank === "number") detailParts.push({ key: "logs.detailTank", value: entry.tank.toFixed(0) });
          if (typeof entry.battery === "number") detailParts.push({ key: "logs.detailBattery", value: entry.battery.toFixed(0) });
          return {
            ts: entry.timestamp,
            eventKey,
            eventType,
            detailParts,
            status,
          };
        });
        setLogs(mapped);
      } catch (e) {
        toast.error(t("logs.fetchError"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [activeBotId]);

  const filtered = logs.filter((log) => {
    const q = query.toLowerCase();
    const eventLabel = t(log.eventKey).toLowerCase();
    const detailLabel = (log.detailParts.length > 0
      ? log.detailParts.map((part: any) => t(part.key, { value: part.value })).join(" · ")
      : t("logs.detailReceived")
    ).toLowerCase();
    const matchQ = eventLabel.includes(q) || detailLabel.includes(q);
    const matchT = type === "all" || log.eventType === type;
    return matchQ && matchT;
  });

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("logs.searchPlaceholder")} className="h-10 pl-9" />
          </div>

          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="h-10 w-full lg:w-44">
              <SelectValue placeholder={t("logs.eventType")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("logs.allEvents")}</SelectItem>
              <SelectItem value="telemetry">{t("logs.telemetry")}</SelectItem>
              <SelectItem value="task">{t("logs.task")}</SelectItem>
              <SelectItem value="tank">{t("logs.tank")}</SelectItem>
              <SelectItem value="device">{t("logs.device")}</SelectItem>
            </SelectContent>
          </Select>

          <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90" onClick={() => toast.success(t("logs.exportSuccess"))}>
            <Download className="mr-2 h-4 w-4" /> {t("button.export")}
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden rounded-2xl">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[180px]">{t("logs.timestamp")}</TableHead>
              <TableHead className="w-[180px]">{t("logs.event")}</TableHead>
              <TableHead>{t("logs.detail")}</TableHead>
              <TableHead className="w-[110px]">{t("logs.status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((log, index) => (
              <TableRow key={`${log.ts}-${log.eventKey}`} className="animate-fade-in" style={{ animationDelay: `${index * 25}ms` }}>
                <TableCell className="font-mono text-xs text-muted-foreground">{log.ts}</TableCell>
                <TableCell className="font-semibold">{t(log.eventKey)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {log.detailParts.length > 0
                    ? log.detailParts.map((part: any) => t(part.key, { value: part.value })).join(" · ")
                    : t("logs.detailReceived")}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`${styles[log.status]} capitalize`}>
                    {log.status === "info"
                      ? t("logs.statusInfo")
                      : log.status === "success"
                      ? t("logs.statusSuccess")
                      : log.status === "warn"
                      ? t("logs.statusWarn")
                      : t("logs.statusError")}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-12 text-center text-sm text-muted-foreground">
                  {isLoading ? t("logs.loading") : activeBotId ? t("logs.noLogs") : t("logs.connectDevice")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
