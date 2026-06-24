"use client";

import React from "react";

type SkeletonProps = {
  width?: string | number;
  height?: string | number;
  rounded?: string | number;
  className?: string;
  style?: React.CSSProperties;
};

const toCssSize = (value?: string | number) => {
  if (value === undefined || value === null) return undefined;
  return typeof value === "number" ? `${value}px` : value;
};

/**
 * Basic skeleton box with shimmer animation.
 */
export function Skeleton({
  width = "100%",
  height = 16,
  rounded = 8,
  className,
  style,
}: SkeletonProps) {
  return (
    <>
      <span
        className={`zh-skeleton${className ? ` ${className}` : ""}`}
        style={{
          width: toCssSize(width),
          height: toCssSize(height),
          borderRadius: toCssSize(rounded),
          ...style,
        }}
        aria-hidden="true"
      />
      <SkeletonStyles />
    </>
  );
}

/**
 * Card placeholder: title + 3 lines.
 */
export function SkeletonCard() {
  return (
    <>
      <div className="zh-skeleton-card" aria-busy="true" aria-live="polite">
        <span
          className="zh-skeleton"
          style={{ width: "60%", height: 20, borderRadius: 8, marginBottom: 16 }}
        />
        <span
          className="zh-skeleton"
          style={{ width: "100%", height: 12, borderRadius: 6, marginBottom: 10 }}
        />
        <span
          className="zh-skeleton"
          style={{ width: "90%", height: 12, borderRadius: 6, marginBottom: 10 }}
        />
        <span
          className="zh-skeleton"
          style={{ width: "75%", height: 12, borderRadius: 6 }}
        />
      </div>
      <SkeletonStyles />
    </>
  );
}

/**
 * Stats grid: 4 stat cards as loading placeholders.
 */
export function SkeletonStats() {
  return (
    <>
      <div className="zh-skeleton-stats" aria-busy="true" aria-live="polite">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="zh-skeleton-stat-card">
            <span
              className="zh-skeleton"
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                marginBottom: 14,
              }}
            />
            <span
              className="zh-skeleton"
              style={{
                width: "50%",
                height: 14,
                borderRadius: 6,
                marginBottom: 10,
              }}
            />
            <span
              className="zh-skeleton"
              style={{ width: "70%", height: 22, borderRadius: 8 }}
            />
          </div>
        ))}
      </div>
      <SkeletonStyles />
    </>
  );
}

type SkeletonTableProps = {
  rows?: number;
  columns?: number;
};

/**
 * Table placeholder with header + rows.
 */
export function SkeletonTable({ rows = 5, columns = 4 }: SkeletonTableProps) {
  return (
    <>
      <div
        className="zh-skeleton-table"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="zh-skeleton-table-row zh-skeleton-table-head">
          {Array.from({ length: columns }).map((_, i) => (
            <span
              key={`h-${i}`}
              className="zh-skeleton"
              style={{ width: "70%", height: 14, borderRadius: 6 }}
            />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={`r-${r}`} className="zh-skeleton-table-row">
            {Array.from({ length: columns }).map((_, c) => (
              <span
                key={`c-${r}-${c}`}
                className="zh-skeleton"
                style={{
                  width: c === 0 ? "85%" : "65%",
                  height: 12,
                  borderRadius: 6,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <SkeletonStyles />
    </>
  );
}

/**
 * Injects shimmer keyframes + base styles once per render tree.
 * Uses styled-jsx (Next.js built-in). Safe to render multiple times.
 */
function SkeletonStyles() {
  return (
    <style jsx global>{`
      @keyframes shimmer {
        0% {
          background-position: -200px 0;
        }
        100% {
          background-position: calc(200px + 100%) 0;
        }
      }

      .zh-skeleton {
        display: inline-block;
        background: linear-gradient(
          90deg,
          var(--surface-soft-strong) 0%,
          var(--surface-soft-hover) 50%,
          var(--surface-soft-strong) 100%
        );
        background-size: 200px 100%;
        background-repeat: no-repeat;
        animation: shimmer 1.5s infinite linear;
        will-change: background-position;
      }

      .zh-skeleton-card {
        display: flex;
        flex-direction: column;
        padding: 20px;
        border-radius: 16px;
        background: var(--surface-card, var(--surface-soft-strong));
        border: 1px solid var(--border-soft, rgba(255, 255, 255, 0.06));
      }

      .zh-skeleton-stats {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 16px;
      }

      .zh-skeleton-stat-card {
        display: flex;
        flex-direction: column;
        padding: 20px;
        border-radius: 16px;
        background: var(--surface-card, var(--surface-soft-strong));
        border: 1px solid var(--border-soft, rgba(255, 255, 255, 0.06));
      }

      .zh-skeleton-table {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 16px;
        border-radius: 16px;
        background: var(--surface-card, var(--surface-soft-strong));
        border: 1px solid var(--border-soft, rgba(255, 255, 255, 0.06));
      }

      .zh-skeleton-table-row {
        display: grid;
        grid-template-columns: repeat(var(--cols, 4), minmax(0, 1fr));
        gap: 16px;
        padding: 12px 8px;
        border-bottom: 1px solid var(--border-soft, rgba(255, 255, 255, 0.06));
      }

      .zh-skeleton-table-row:last-child {
        border-bottom: none;
      }

      .zh-skeleton-table-head .zh-skeleton {
        opacity: 0.8;
      }

      @media (max-width: 900px) {
        .zh-skeleton-stats {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 540px) {
        .zh-skeleton-stats {
          grid-template-columns: 1fr;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .zh-skeleton {
          animation: none;
        }
      }
    `}</style>
  );
}

export default Skeleton;
