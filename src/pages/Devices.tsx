import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MonitorSmartphone, Wifi, WifiOff } from "lucide-react";
import { monitoredDeviceList } from "@/lib/monitoring-devices";

export default function Devices() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 rounded-2xl border bg-gradient-surface p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Badge variant="outline" className="mb-2 border-primary/30 bg-primary/10 text-primary">Multiple bot monitoring</Badge>
          <h1 className="font-display text-2xl font-extrabold">Connected Devices</h1>
          <p className="mt-1 text-sm text-muted-foreground">View all pesticide spraying bots connected for monitoring and analytics.</p>
        </div>
        <Badge variant="outline" className="w-fit border-primary/30 bg-primary/10 text-primary">Read-only device list</Badge>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {monitoredDeviceList.map((device) => {
          const active = device.state === "Active";
          return (
            <Card key={device.id} className="rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <MonitorSmartphone className="h-5 w-5 text-primary" />
                </span>
                <Badge variant="outline" className={active ? "border-success/30 bg-success/10 text-success" : "border-muted-foreground/30 bg-muted text-muted-foreground"}>
                  {active ? <Wifi className="mr-1 h-3 w-3" /> : <WifiOff className="mr-1 h-3 w-3" />}
                  {device.state}
                </Badge>
              </div>
              <h2 className="mt-4 font-display text-lg font-bold">{device.id}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{device.name} · Last Sync Time: {device.sync}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-secondary p-3">
                  <p className="text-muted-foreground">Distance</p>
                  <p className="mt-1 font-mono font-bold">{device.distance} km</p>
                </div>
                <div className="rounded-xl bg-secondary p-3">
                  <p className="text-muted-foreground">Area</p>
                  <p className="mt-1 font-mono font-bold">{device.area} ha</p>
                </div>
              </div>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
