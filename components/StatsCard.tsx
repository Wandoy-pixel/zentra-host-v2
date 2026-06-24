"use client";

import CountUp from "@/components/CountUp";
import Sparkline from "@/components/Sparkline";

interface StatsCardProps {
  ic: string;
  value: number;
  label: string;
  bg: string;
  cl: string;
  /**
   * Optional prefix for the animated number (e.g. "Rp ").
   * When provided the value is rendered as a localized number with prefix.
   */
  prefix?: string;
  /**
   * If true, render a small Sparkline trend chart under the number.
   */
  showSparkline?: boolean;
  /**
   * Series for the Sparkline. If omitted but showSparkline is true, a
   * sensible default trend ending at `value` is generated.
   */
  sparklineData?: number[];
  /**
   * CountUp animation duration in ms. Defaults to 1500ms (premium slot-machine feel).
   */
  duration?: number;
}

export default function StatsCard({
  ic,
  value,
  label,
  bg,
  cl,
  prefix,
  showSparkline = false,
  sparklineData,
  duration = 1500,
}: StatsCardProps) {
  const data =
    sparklineData ??
    (showSparkline ? [100, 200, 150, 300, 400, 350, value] : undefined);

  return (
    <div className="card transition-all hover:-translate-y-1">
      <div
        className="w-10 h-10 rounded-xl grid place-items-center text-lg mb-3"
        style={{ background: bg, color: cl }}
      >
        {ic}
      </div>
      <h2 className="font-extrabold text-2xl">
        <CountUp value={value} prefix={prefix ?? ""} duration={duration} />
      </h2>
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
      {showSparkline && data && (
        <div className="mt-3">
          <Sparkline
            data={data}
            width={140}
            height={36}
            color={cl}
            fillColor={bg}
            strokeWidth={2}
          />
        </div>
      )}
    </div>
  );
}
