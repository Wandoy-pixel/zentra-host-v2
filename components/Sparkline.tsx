"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

type SparklineProps = {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
  strokeWidth?: number;
  showDot?: boolean;
  showFill?: boolean;
  animate?: boolean;
  className?: string;
  ariaLabel?: string;
};

export default function Sparkline({
  data,
  width = 120,
  height = 40,
  color = "var(--accent)",
  fillColor = "rgba(20,184,166,0.15)",
  strokeWidth = 2,
  showDot = true,
  showFill = true,
  animate = true,
  className,
  ariaLabel = "Trend chart",
}: SparklineProps) {
  const reactId = useId();
  const gradientId = `sparkline-fill-${reactId.replace(/[:]/g, "")}`;
  const glowId = `sparkline-glow-${reactId.replace(/[:]/g, "")}`;

  const pathRef = useRef<SVGPathElement | null>(null);
  const [pathLength, setPathLength] = useState(0);

  // Defensive padding so the stroke and dot don't get clipped at edges.
  const padX = strokeWidth + 2;
  const padY = strokeWidth + 2;
  const innerW = Math.max(1, width - padX * 2);
  const innerH = Math.max(1, height - padY * 2);

  const { linePath, areaPath, points } = useMemo(() => {
    const safeData =
      Array.isArray(data) && data.length > 0 ? data : [0, 0];

    if (safeData.length === 1) {
      const x = padX + innerW / 2;
      const y = padY + innerH / 2;
      return {
        linePath: `M ${x} ${y}`,
        areaPath: `M ${padX} ${height - padY} L ${x} ${y} L ${
          width - padX
        } ${height - padY} Z`,
        points: [{ x, y, v: safeData[0] }],
      };
    }

    const max = Math.max(...safeData);
    const min = Math.min(...safeData);
    const range = max - min || 1;

    const pts = safeData.map((v, i) => ({
      x: padX + (i / (safeData.length - 1)) * innerW,
      y: padY + innerH - ((v - min) / range) * innerH,
      v,
    }));

    // Smooth path using quadratic Bezier between midpoints.
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const midX = (curr.x + next.x) / 2;
      const midY = (curr.y + next.y) / 2;
      d += ` Q ${curr.x} ${curr.y} ${midX} ${midY}`;
    }
    // Final segment to the last point.
    const last = pts[pts.length - 1];
    d += ` T ${last.x} ${last.y}`;

    const area =
      `${d} L ${last.x} ${height - padY} L ${pts[0].x} ${
        height - padY
      } Z`;

    return { linePath: d, areaPath: area, points: pts };
  }, [data, innerH, innerW, padX, padY, height, width]);

  // Measure path length after render for the draw-in animation.
  useEffect(() => {
    if (!animate) return;
    if (pathRef.current) {
      try {
        const len = pathRef.current.getTotalLength();
        setPathLength(len);
      } catch {
        setPathLength(0);
      }
    }
  }, [linePath, animate]);

  const lastPoint = points[points.length - 1];

  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillColor} stopOpacity="1" />
          <stop offset="100%" stopColor={fillColor} stopOpacity="0" />
        </linearGradient>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {showFill && (
        <path
          d={areaPath}
          fill={`url(#${gradientId})`}
          stroke="none"
          style={{
            opacity: animate ? 0 : 1,
            animation: animate
              ? "sparklineFadeIn 600ms ease-out 400ms forwards"
              : undefined,
          }}
        />
      )}

      <path
        ref={pathRef}
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={
          animate && pathLength > 0
            ? {
                strokeDasharray: pathLength,
                strokeDashoffset: pathLength,
                animation:
                  "sparklineDraw 900ms cubic-bezier(0.65, 0, 0.35, 1) forwards",
              }
            : undefined
        }
      />

      {showDot && lastPoint && (
        <g
          style={{
            opacity: animate ? 0 : 1,
            animation: animate
              ? "sparklineFadeIn 300ms ease-out 900ms forwards"
              : undefined,
          }}
        >
          <circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r={strokeWidth + 2}
            fill={color}
            opacity={0.25}
            filter={`url(#${glowId})`}
          />
          <circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r={strokeWidth}
            fill={color}
            stroke="var(--bg, #fff)"
            strokeWidth={1}
          />
        </g>
      )}

      <style>{`
        @keyframes sparklineDraw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes sparklineFadeIn {
          to { opacity: 1; }
        }
      `}</style>
    </svg>
  );
}
