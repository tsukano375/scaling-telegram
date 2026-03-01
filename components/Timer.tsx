"use client";

import { useEffect, useRef, useState } from "react";

interface TimerProps {
  totalSeconds: number;
  running: boolean;
  onExpire: () => void;
  onTick?: (elapsed: number) => void;
}

export default function Timer({ totalSeconds, running, onExpire, onTick }: TimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const expiredRef = useRef(false);

  useEffect(() => {
    if (running && !expiredRef.current) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1;
          onTick?.(next);
          if (next >= totalSeconds) {
            clearInterval(intervalRef.current!);
            if (!expiredRef.current) {
              expiredRef.current = true;
              onExpire();
            }
          }
          return next;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const remaining = totalSeconds - elapsed;
  const pct = (elapsed / totalSeconds) * 100;
  const isUrgent = remaining <= 30;

  const mm = Math.floor(remaining / 60).toString().padStart(2, "0");
  const ss = (remaining % 60).toString().padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`text-3xl font-mono font-bold tabular-nums transition-colors ${
          isUrgent ? "text-red-500" : "text-gray-700"
        }`}
      >
        {mm}:{ss}
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            isUrgent ? "bg-red-400" : "bg-indigo-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
