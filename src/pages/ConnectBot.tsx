import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Wifi, 
  Search, 
  Cpu, 
  AlertCircle, 
  Loader2, 
  SignalHigh, 
  ChevronLeft,
  Tractor,
  Radio
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/config";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

export default function ConnectDevice() {
  const navigate = useNavigate();
  const { connectBot } = useAuth();
  const { t } = useLanguage();
  const [isScanning, setIsScanning] = useState(true);
  const [nearbyBots, setNearbyBots] = useState<any[]>([]);

  const [manualBotId, setManualBotId] = useState("");
  const [manualName, setManualName] = useState("");
  const [manualChannelId, setManualChannelId] = useState("");
  const [manualReadKey, setManualReadKey] = useState("");
  const [isManualConnecting, setIsManualConnecting] = useState(false);

  useEffect(() => {
    handleStartDiscovery();
  }, []);

  const handleStartDiscovery = async () => {
    setIsScanning(true);
    try {
      const token = localStorage.getItem("agri_token");
      const res = await fetch(`${API_URL}/api/available-bots`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setNearbyBots(data.map((b: any) => ({
        ...b,
        signal: "Strong",
        status: "Ready"
      })));
    } catch (e) {
      console.error("Failed to fetch available bots", e);
    } finally {
      setTimeout(() => setIsScanning(false), 2000);
    }
  };

  const handleConnectBot = async (botId: string, nameOverride?: string) => {
    toast.success(t("connect.connectingToast", { botId }), {
      description: t("connect.connectingDesc")
    });
    try {
      const token = localStorage.getItem("agri_token");
      const res = await fetch(`${API_URL}/api/bots`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ botId, name: nameOverride || nearbyBots.find(b => b.id === botId)?.name || botId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setTimeout(() => {
        connectBot(botId);
        toast.info(t("connect.syncedToast", { botId }), {
          icon: <Wifi className="h-4 w-4 text-primary" />
        });
        navigate("/"); 
      }, 1500);
    } catch (e: any) {
      toast.error(e.message || t("connect.connectionFailed"));
    }
  };

  const validateThingSpeak = async (channelId: string, readKey: string) => {
    const url = `https://api.thingspeak.com/channels/${encodeURIComponent(
      channelId,
    )}/feeds.json?api_key=${encodeURIComponent(readKey)}&results=1`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(t("connect.invalidChannel"));
    const data = await res.json();
    const feeds = Array.isArray(data?.feeds) ? data.feeds : [];
    if (feeds.length === 0) throw new Error(t("connect.noTelemetry"));
  };

  const handleManualConnect = async () => {
    if (!manualBotId || !manualChannelId || !manualReadKey) {
      toast.error(t("connect.missingFields"));
      return;
    }
    setIsManualConnecting(true);
    try {
      await validateThingSpeak(manualChannelId, manualReadKey);
      await handleConnectBot(manualBotId, manualName || manualBotId);
    } catch (e: any) {
      toast.error(e.message || t("connect.validationFailed"));
    } finally {
      setIsManualConnecting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <header className="flex flex-col gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="w-fit -ml-2 rounded-xl text-muted-foreground hover:text-primary"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> {t("button.back")}
        </Button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="border-primary/30 bg-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary">{t("connect.devicePairing")}</Badge>
              <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-widest bg-success/10 text-success border-success/20">
                <Radio className="mr-1 h-3 w-3 animate-pulse" /> {t("connect.liveScanning")}
              </Badge>
            </div>
            <h1 className="font-display text-4xl font-black tracking-tight">{t("connect.botDiscovery")}</h1>
            <p className="mt-2 text-muted-foreground text-lg">{t("connect.searchingDesc")}</p>
          </div>
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-primary shadow-glow shrink-0">
            <Tractor className="h-10 w-10 text-primary-foreground" />
          </div>
        </div>
      </header>

      <section className="grid gap-6">
        {isScanning ? (
          <Card className="flex flex-col items-center justify-center py-24 text-center rounded-[2.5rem] border-2 border-dashed bg-gradient-iot/5 border-primary/20">
            <div className="relative mb-8">
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
              <Loader2 className="h-20 w-20 animate-spin text-primary opacity-20" />
              <Search className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" />
            </div>
            <h2 className="text-2xl font-black mb-2">{t("connect.scanningTitle")}</h2>
            <p className="text-muted-foreground max-w-sm px-6">{t("connect.scanningDesc")}</p>
          </Card>
        ) : (
          <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between px-2">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{t("connect.availableNearby")}</p>
              <Button variant="link" onClick={handleStartDiscovery} className="text-primary font-bold">{t("button.rescanNetwork")}</Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {nearbyBots.length > 0 ? (
                nearbyBots.map((bot) => (
                  <Card 
                    key={bot.id}
                    className={`group relative overflow-hidden rounded-[2rem] border-2 p-6 transition-all hover:border-primary/50 hover:bg-primary/5 hover:shadow-xl active:scale-[0.98] cursor-pointer ${
                      bot.status !== "Ready" ? "opacity-60 grayscale cursor-not-allowed" : ""
                    }`}
                    onClick={() => bot.status === "Ready" && handleConnectBot(bot.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/80 group-hover:bg-primary/10 transition-colors">
                        <Wifi className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline" className={`font-bold border-success/30 text-success bg-success/5 ${bot.status !== "Ready" ? "opacity-0" : ""}`}>
                          {bot.signal === "Strong" ? t("status.strongSignal") : bot.signal} {t("connect.signal")}
                        </Badge>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{bot.status === "Ready" ? t("status.ready") : bot.status}</p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <h3 className="text-xl font-black">{bot.name}</h3>
                      <p className="text-sm text-muted-foreground font-mono mt-1">{t("connect.hardwareId", { botId: bot.id })}</p>
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                      <p className="text-xs font-bold text-primary flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                        {t("connect.esp32Ready")}
                      </p>
                      <Button size="sm" className="rounded-xl h-8 px-4 font-bold">{t("connect.connectNow")}</Button>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="col-span-full py-20 flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed bg-muted/5">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <AlertCircle className="h-10 w-10" />
                  </div>
                  <h2 className="text-2xl font-black mb-2">{t("connect.noBotsTitle")}</h2>
                  <p className="text-muted-foreground max-w-sm text-center px-6">{t("connect.noBotsDesc")}</p>
                  <Button variant="outline" onClick={handleStartDiscovery} className="mt-8 rounded-xl h-12 px-8 border-primary/20 text-primary font-bold">
                    {t("button.scanAgain")}
                  </Button>
                </Card>
              )}
            </div>

            <div className="mt-12 p-8 rounded-[2.5rem] bg-secondary/30 border border-dashed border-muted-foreground/20 text-center">
              <h3 className="font-bold text-lg mb-2">{t("connect.cantFindBot")}</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                {t("connect.manualDesc")}
              </p>
              <div className="grid gap-4 max-w-2xl mx-auto">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 text-left">
                    <Label htmlFor="manualBotId">{t("connect.botId")}</Label>
                    <Input
                      id="manualBotId"
                      placeholder={t("connect.botIdPlaceholder")}
                      className="h-12 rounded-xl bg-background border-primary/20"
                      value={manualBotId}
                      onChange={(e) => setManualBotId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <Label htmlFor="manualName">{t("connect.botNameOptional")}</Label>
                    <Input
                      id="manualName"
                      placeholder={t("connect.botNamePlaceholder")}
                      className="h-12 rounded-xl bg-background border-primary/20"
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <Label htmlFor="manualChannelId">{t("connect.channelId")}</Label>
                    <Input
                      id="manualChannelId"
                      placeholder={t("connect.channelPlaceholder")}
                      className="h-12 rounded-xl bg-background border-primary/20"
                      value={manualChannelId}
                      onChange={(e) => setManualChannelId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <Label htmlFor="manualReadKey">{t("connect.readApiKey")}</Label>
                    <Input
                      id="manualReadKey"
                      placeholder={t("connect.readKeyPlaceholder")}
                      className="h-12 rounded-xl bg-background border-primary/20"
                      value={manualReadKey}
                      onChange={(e) => setManualReadKey(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleManualConnect}
                  disabled={isManualConnecting}
                  className="rounded-xl h-12 px-8 font-bold shadow-glow"
                >
                  {isManualConnecting ? t("button.validating") : t("button.validateConnect")}
                </Button>
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-4 border-t pt-6 border-dashed">
                <Button variant="ghost" className="rounded-xl h-10 px-6 font-bold text-xs text-muted-foreground">{t("button.thingSpeakSetup")}</Button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
