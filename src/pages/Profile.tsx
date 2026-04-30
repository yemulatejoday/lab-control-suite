import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Clock3, Mail, MonitorCheck, ShieldCheck, Tractor, UserRound } from "lucide-react";
import { monitoredDeviceList } from "@/lib/monitoring-devices";

const profileItems = [
  { label: "User Name", value: "Agri Monitor User", icon: UserRound },
  { label: "Email", value: "monitor@agrispray.io", icon: Mail },
  { label: "Total Connected Devices", value: `${monitoredDeviceList.length} Bots`, icon: Tractor },
  { label: "Monitoring Access", value: "Read Only", icon: ShieldCheck },
];

const activity = monitoredDeviceList.map((device) => ({
  device: `${device.name} · ${device.id}`,
  lastActive: device.sync,
  status: device.state,
  task: device.task,
}));

export default function Profile() {
  return (
    <div className="space-y-6">
      <Card className="rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-gradient-iot text-lg font-bold text-primary-foreground">AM</AvatarFallback>
          </Avatar>
          <div>
            <Badge variant="outline" className="mb-2 border-primary/30 bg-primary/10 text-primary">Profile</Badge>
            <h1 className="font-display text-2xl font-extrabold">Agri Monitor User</h1>
            <p className="text-sm text-muted-foreground">Read-only access for pesticide spraying bot monitoring and analytics.</p>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {profileItems.map((item) => (
          <Card key={item.label} className="rounded-2xl p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <item.icon className="h-5 w-5 text-primary" />
            </span>
            <p className="mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">{item.label}</p>
            <p className="mt-2 break-words font-display text-lg font-bold">{item.value}</p>
          </Card>
        ))}
      </section>

      <Card className="rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-display font-bold">
            <Clock3 className="h-4 w-4 text-primary" /> Recent Device Activity
          </div>
          <Badge variant="outline" className="border-primary/30 text-primary">
            <MonitorCheck className="mr-1 h-3 w-3" /> Monitoring records
          </Badge>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-3 pr-4 font-semibold">Device ID</th>
                <th className="py-3 pr-4 font-semibold">Last Active Time</th>
                <th className="py-3 pr-4 font-semibold">Status</th>
                <th className="py-3 pr-4 font-semibold">Last Task Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {activity.map((item) => (
                <tr key={item.device}>
                  <td className="py-3 pr-4 font-semibold">{item.device}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">{item.lastActive}</td>
                  <td className="py-3 pr-4">
                    <Badge variant="outline" className={item.status === "Active" ? "border-success/30 bg-success/10 text-success" : "border-muted-foreground/30 bg-muted text-muted-foreground"}>{item.status}</Badge>
                  </td>
                  <td className="py-3 pr-4">
                    <Badge variant="outline" className={item.task === "Completed" ? "border-primary/30 bg-primary/10 text-primary" : "border-accent/30 bg-accent/10 text-accent"}>{item.task}</Badge>
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
