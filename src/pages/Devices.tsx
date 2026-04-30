import { MonitorSmartphone, Wifi, WifiOff, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/config";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function Devices() {
  const { activeBotId } = useAuth();
  const navigate = useNavigate();
  const [bots, setBots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBots = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("agri_token");
        const res = await fetch(`${API_URL}/api/bots`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setBots(data);
      } catch (e) {
        toast.error("Failed to fetch registered bots");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBots();
  }, []);

  const hasDevices = bots.length > 0;

  if (!hasDevices && !isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-primary/10 text-primary animate-pulse">
          <MonitorSmartphone className="h-12 w-12" />
        </div>
        <h2 className="font-display text-3xl font-black tracking-tight">No Devices Connected</h2>
        <p className="mt-2 max-w-md text-muted-foreground">Your device registry is currently empty. Please connect a bot from the dashboard to start monitoring.</p>
        <Button onClick={() => navigate("/")} size="lg" className="mt-8 h-14 rounded-2xl px-8 text-lg font-bold shadow-glow transition-all hover:scale-105 active:scale-95">
          Go to Dashboard to Connect
        </Button>
      </div>
    );
  }

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
        {bots.map((bot) => {
          const isActive = bot.id === activeBotId;
          return (
            <Card key={bot.id} className="rounded-2xl p-5 border-primary/10 hover:border-primary/30 transition-all">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <MonitorSmartphone className="h-5 w-5 text-primary" />
                </span>
                <Badge variant="outline" className={isActive ? "border-success/30 bg-success/10 text-success" : "border-muted-foreground/30 bg-muted text-muted-foreground"}>
                  {isActive ? <Wifi className="mr-1 h-3 w-3" /> : <WifiOff className="mr-1 h-3 w-3" />}
                  {isActive ? "Active" : "Offline"}
                </Badge>
              </div>
              <h2 className="mt-4 font-display text-lg font-bold">{bot.id}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{bot.name} · Connected HW ID</p>
              <div className="mt-6 flex flex-col gap-2">
                <Button size="sm" variant="outline" className="w-full rounded-xl text-xs h-9" onClick={() => navigate("/")}>
                  View Dashboard
                </Button>
              </div>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
