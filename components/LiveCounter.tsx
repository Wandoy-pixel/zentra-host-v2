"use client";

import { useEffect, useState } from "react";
import CountUp from "./CountUp";

interface LiveCounterProps {
  initialCount?: number;
  label?: string;
}

const randomInRange = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export default function LiveCounter({
  initialCount,
  label = "customer online sekarang",
}: LiveCounterProps) {
  const [count, setCount] = useState<number>(() =>
    typeof initialCount === "number" ? initialCount : randomInRange(150, 300)
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCount((prev) => {
        const delta = randomInRange(1, 5);
        const direction = Math.random() < 0.5 ? -1 : 1;
        let next = prev + delta * direction;
        // Keep within a believable range
        if (next < 120) next = 120 + randomInRange(0, 10);
        if (next > 400) next = 400 - randomInRange(0, 10);
        return next;
      });
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <span
      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold"
      style={{
        background: "rgba(16,185,129,0.10)",
        border: "1px solid rgba(16,185,129,0.35)",
        color: "#10b981",
      }}
      aria-live="polite"
    >
      <span className="relative inline-flex w-2.5 h-2.5">
        <span
          className="absolute inset-0 rounded-full animate-ping"
          style={{ background: "#10b981", opacity: 0.55 }}
        />
        <span
          className="relative inline-flex w-2.5 h-2.5 rounded-full"
          style={{
            background: "#10b981",
            boxShadow: "0 0 10px #10b981",
          }}
        />
      </span>
      <span className="tabular-nums">
        <CountUp value={count} duration={1200} />
      </span>
      <span>{label}</span>
    </span>
  );
}
