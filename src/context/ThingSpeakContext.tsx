import { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode, useCallback } from "react";
import { toast } from "sonner";

export type ConnState = "idle" | "loading" | "connected" | "error";

export interface ThingSpeakConfig {
  channelId: string;
  readKey: string;
  label?: string;
}

export interface ThingSpeakFeed {
  created_at: string;
  entry_id: number;
  field1?: string | null; // tank %
  field2?: string | null; // distance traveled
  field3?: string | null; // area covered
  field4?: string | null; // pesticide sprayed
  field5?: string | null; // operating time
  field6?: string | null; // task completion
  field7?: string | null;
  field8?: string | null;
}

interface ThingSpeakState {
  config: ThingSpeakConfig | null;
  devices: ThingSpeakConfig[];
  status: ConnState;
  esp32: ConnState;
  feeds: ThingSpeakFeed[];
  latest: ThingSpeakFeed | null;
  refreshInterval: number;
  lastFetched: Date | null;
  saveConfig: (cfg: ThingSpeakConfig) => void;
  removeDevice: (channelId: string) => void;
  selectDevice: (channelId: string) => void;
  connect: (cfg?: ThingSpeakConfig) => Promise<boolean>;
  disconnect: () => void;
  setRefreshInterval: (ms: number) => void;
  isDemoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
}

const STORAGE_KEY = "thingspeak.devices.v1";
const REFRESH_KEY = "thingspeak.refresh.v1";

const Ctx = createContext<ThingSpeakState | null>(null);

export function ThingSpeakProvider({ children }: { children: ReactNode }) {
  const [devices, setDevices] = useState<ThingSpeakConfig[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as ThingSpeakConfig[]) : [];
    } catch {
      return [];
    }
  });
  const [config, setConfig] = useState<ThingSpeakConfig | null>(() => devices[0] ?? null);
  const [status, setStatus] = useState<ConnState>("idle");
  const [esp32, setEsp32] = useState<ConnState>("idle");
  const [feeds, setFeeds] = useState<ThingSpeakFeed[]>([]);
  const [refreshInterval, setRefreshIntervalState] = useState<number>(() => {
    const stored = Number(localStorage.getItem(REFRESH_KEY));
    return stored && stored >= 5000 ? stored : 15000;
  });
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [isDemoMode, setDemoMode] = useState<boolean>(() => {
    return localStorage.getItem("thingspeak.demomode") === "true";
  });
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(devices));
  }, [devices]);

  useEffect(() => {
    localStorage.setItem(REFRESH_KEY, String(refreshInterval));
  }, [refreshInterval]);

  useEffect(() => {
    localStorage.setItem("thingspeak.demomode", String(isDemoMode));
  }, [isDemoMode]);

  const fetchFeeds = useCallback(async (cfg: ThingSpeakConfig) => {
    if (!cfg.channelId || !cfg.readKey) return false;
    try {
      const url = `https://api.thingspeak.com/channels/${encodeURIComponent(
        cfg.channelId,
      )}/feeds.json?api_key=${encodeURIComponent(cfg.readKey)}&results=30`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list: ThingSpeakFeed[] = data?.feeds ?? [];
      setFeeds(list);
      setLastFetched(new Date());
      setStatus("connected");
      setEsp32("connected");
      return true;
    } catch (e) {
      setStatus("error");
      setEsp32("error");
      return false;
    }
  }, []);

  // Polling
  useEffect(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    if (status === "connected" && config) {
      timerRef.current = window.setInterval(() => {
        fetchFeeds(config);
      }, refreshInterval);
    }
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [status, config, refreshInterval, fetchFeeds]);

  const connect = useCallback(
    async (cfg?: ThingSpeakConfig) => {
      const target = cfg ?? config;
      if (!target) {
        toast.error("No ThingSpeak configuration");
        return false;
      }
      setStatus("loading");
      setEsp32("loading");
      const ok = await fetchFeeds(target);
      if (ok) {
        toast.success("Connected to ThingSpeak", {
          description: `Channel ${target.channelId}`,
        });
      } else {
        toast.error("Connection failed", {
          description: "Check your Channel ID and Read API Key",
        });
      }
      return ok;
    },
    [config, fetchFeeds],
  );

  const saveConfig = useCallback((cfg: ThingSpeakConfig) => {
    setDevices((prev) => {
      const idx = prev.findIndex((d) => d.channelId === cfg.channelId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = cfg;
        return next;
      }
      return [...prev, cfg];
    });
    setConfig(cfg);
    toast.success("Device saved");
  }, []);

  const removeDevice = useCallback(
    (channelId: string) => {
      setDevices((prev) => prev.filter((d) => d.channelId !== channelId));
      if (config?.channelId === channelId) {
        setConfig(null);
        setStatus("idle");
        setEsp32("idle");
        setFeeds([]);
      }
      toast.success("Device removed");
    },
    [config],
  );

  const selectDevice = useCallback(
    (channelId: string) => {
      const found = devices.find((d) => d.channelId === channelId);
      if (found) {
        setConfig(found);
        setStatus("idle");
      }
    },
    [devices],
  );

  const disconnect = useCallback(() => {
    setStatus("idle");
    setEsp32("idle");
    setFeeds([]);
    if (timerRef.current) window.clearInterval(timerRef.current);
    toast.message("Disconnected from ThingSpeak");
  }, []);

  const setRefreshInterval = useCallback((ms: number) => setRefreshIntervalState(ms), []);

  const latest = feeds.length ? feeds[feeds.length - 1] : null;

  const value = useMemo<ThingSpeakState>(
    () => ({
      config,
      devices,
      status,
      esp32,
      feeds,
      latest,
      refreshInterval,
      lastFetched,
      saveConfig,
      removeDevice,
      selectDevice,
      connect,
      disconnect,
      setRefreshInterval,
      isDemoMode,
      setDemoMode,
    }),
    [
      config,
      devices,
      status,
      esp32,
      feeds,
      latest,
      refreshInterval,
      lastFetched,
      saveConfig,
      removeDevice,
      selectDevice,
      connect,
      disconnect,
      setRefreshInterval,
      isDemoMode,
      setDemoMode,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useThingSpeak() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useThingSpeak must be used within ThingSpeakProvider");
  return ctx;
}

export function asNumber(v: string | null | undefined, fallback = 0): number {
  if (v === null || v === undefined || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
