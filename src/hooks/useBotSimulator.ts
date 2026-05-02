import { useState, useEffect, useRef } from "react";

export interface BotState {
  distance: number;
  area: number;
  pesticide: number;
  time: number;
  completion: number;
  battery: number;
  tank: number;
  status: "Active" | "Idle" | "Offline" | "Error";
  alerts: string[];
}

export function useBotSimulator(deviceId: string, initialState?: Partial<BotState>, enabled: boolean = false) {
  const [state, setState] = useState<BotState>({
    distance: 1240,
    area: 3.6,
    pesticide: 21.3,
    time: 6.2,
    completion: 68,
    battery: 84,
    tank: 72,
    status: "Active",
    alerts: [],
    ...initialState
  });

  useEffect(() => {
    if (initialState) {
      setState(prev => ({ ...prev, ...initialState }));
    }
  }, [deviceId]);

  const lastUpdate = useRef(Date.now());

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      setState((prev) => {
        // Randomly simulate a slight increase in metrics
        const isMoving = Math.random() > 0.1;
        if (!isMoving) return prev;

        const newDistance = prev.distance + (Math.random() * 2 + 1); // increment by 1-3 meters
        const newArea = prev.area + 0.0005 * (Math.random() + 0.5); // area increment (smaller per 2s)
        const newPesticide = prev.pesticide + 0.01 * (Math.random() + 0.5);
        const newTime = prev.time + (1 / 3600); // increment by 1 second
        const newCompletion = Math.min(100, prev.completion + 0.1);
        const newBattery = Math.max(0, prev.battery - 0.01);
        const newTank = Math.max(0, prev.tank - 0.02);

        const alerts: string[] = [];
        if (newTank < 15) alerts.push("Low Pesticide Level: Tank below 15%");
        if (newBattery < 20) alerts.push("Low Battery: Return to base soon");
        
        // Randomly simulate an error (rare)
        const hasError = Math.random() < 0.001;

        return {
          ...prev,
          distance: Number(newDistance.toFixed(2)),
          area: newArea,
          pesticide: newPesticide,
          time: newTime,
          completion: Math.round(newCompletion),
          battery: Number(newBattery.toFixed(1)),
          tank: Number(newTank.toFixed(1)),
          status: hasError ? "Error" : "Active",
          alerts,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [enabled]);

  return state;
}
