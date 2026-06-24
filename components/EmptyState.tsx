"use client";

import Link from "next/link";
import { ReactNode } from "react";

type Variant = "default" | "hosting" | "invoice" | "domain" | "backup" | "tickets";

interface EmptyStateProps {
  variant?: Variant;
  title: string;
  description?: string;
  action?: { label: string; href: string };
}

function Illustration({ variant }: { variant: Variant }) {
  const accent = "var(--accent)";
  const common = {
    width: 200,
    height: 200,
    viewBox: "0 0 200 200",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true as const,
  };

  switch (variant) {
    case "hosting":
      // Server stack
      return (
        <svg {...common}>
          <ellipse cx="100" cy="170" rx="70" ry="8" fill={accent} opacity="0.1" />
          {/* Server unit 3 (back) */}
          <rect
            x="40"
            y="40"
            width="120"
            height="32"
            rx="6"
            fill={accent}
            opacity="0.25"
          />
          <circle cx="55" cy="56" r="3" fill={accent} opacity="0.7" />
          <circle cx="68" cy="56" r="3" fill={accent} opacity="0.5" />
          <rect x="130" y="52" width="20" height="8" rx="2" fill={accent} opacity="0.4" />
          {/* Server unit 2 (mid) */}
          <rect
            x="40"
            y="82"
            width="120"
            height="32"
            rx="6"
            fill={accent}
            opacity="0.55"
          />
          <circle cx="55" cy="98" r="3" fill="#ffffff" opacity="0.9" />
          <circle cx="68" cy="98" r="3" fill="#ffffff" opacity="0.6" />
          <rect x="130" y="94" width="20" height="8" rx="2" fill="#ffffff" opacity="0.6" />
          {/* Server unit 1 (front) */}
          <rect
            x="40"
            y="124"
            width="120"
            height="32"
            rx="6"
            fill={accent}
            opacity="0.9"
          />
          <circle cx="55" cy="140" r="3" fill="#ffffff" />
          <circle cx="68" cy="140" r="3" fill="#ffffff" opacity="0.7" />
          <rect x="130" y="136" width="20" height="8" rx="2" fill="#ffffff" opacity="0.8" />
        </svg>
      );

    case "invoice":
      // Paper document with lines
      return (
        <svg {...common}>
          <ellipse cx="100" cy="178" rx="55" ry="6" fill={accent} opacity="0.1" />
          {/* Back paper */}
          <rect
            x="58"
            y="32"
            width="90"
            height="120"
            rx="6"
            fill={accent}
            opacity="0.25"
            transform="rotate(-6 103 92)"
          />
          {/* Front paper */}
          <rect
            x="55"
            y="36"
            width="90"
            height="124"
            rx="6"
            fill={accent}
            opacity="0.9"
          />
          {/* Header */}
          <rect x="65" y="50" width="40" height="6" rx="2" fill="#ffffff" opacity="0.95" />
          <rect x="65" y="62" width="25" height="4" rx="2" fill="#ffffff" opacity="0.6" />
          {/* Lines */}
          <rect x="65" y="82" width="70" height="3" rx="1.5" fill="#ffffff" opacity="0.55" />
          <rect x="65" y="92" width="60" height="3" rx="1.5" fill="#ffffff" opacity="0.55" />
          <rect x="65" y="102" width="70" height="3" rx="1.5" fill="#ffffff" opacity="0.55" />
          <rect x="65" y="112" width="45" height="3" rx="1.5" fill="#ffffff" opacity="0.55" />
          {/* Total line */}
          <line x1="65" y1="128" x2="135" y2="128" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="1" />
          <rect x="65" y="136" width="30" height="5" rx="2" fill="#ffffff" />
          <rect x="110" y="136" width="25" height="5" rx="2" fill="#ffffff" />
        </svg>
      );

    case "domain":
      // Globe
      return (
        <svg {...common}>
          <ellipse cx="100" cy="172" rx="55" ry="6" fill={accent} opacity="0.1" />
          <circle cx="100" cy="100" r="62" fill={accent} opacity="0.2" />
          <circle cx="100" cy="100" r="55" fill={accent} opacity="0.85" />
          {/* Meridians */}
          <ellipse
            cx="100"
            cy="100"
            rx="22"
            ry="55"
            stroke="#ffffff"
            strokeOpacity="0.7"
            strokeWidth="1.5"
            fill="none"
          />
          <ellipse
            cx="100"
            cy="100"
            rx="45"
            ry="55"
            stroke="#ffffff"
            strokeOpacity="0.5"
            strokeWidth="1.5"
            fill="none"
          />
          <line
            x1="100"
            y1="45"
            x2="100"
            y2="155"
            stroke="#ffffff"
            strokeOpacity="0.7"
            strokeWidth="1.5"
          />
          {/* Equators */}
          <line
            x1="45"
            y1="100"
            x2="155"
            y2="100"
            stroke="#ffffff"
            strokeOpacity="0.7"
            strokeWidth="1.5"
          />
          <ellipse
            cx="100"
            cy="100"
            rx="55"
            ry="20"
            stroke="#ffffff"
            strokeOpacity="0.5"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Highlight */}
          <ellipse
            cx="82"
            cy="78"
            rx="14"
            ry="10"
            fill="#ffffff"
            opacity="0.2"
            transform="rotate(-30 82 78)"
          />
        </svg>
      );

    case "backup":
      // Cloud
      return (
        <svg {...common}>
          <ellipse cx="100" cy="170" rx="65" ry="7" fill={accent} opacity="0.1" />
          {/* Back cloud */}
          <path
            d="M 55 130 Q 35 130 35 110 Q 35 92 55 90 Q 60 70 82 70 Q 100 52 122 70 Q 145 70 150 92 Q 168 95 168 112 Q 168 130 148 130 Z"
            fill={accent}
            opacity="0.25"
            transform="translate(8 -8)"
          />
          {/* Front cloud */}
          <path
            d="M 55 138 Q 32 138 32 116 Q 32 96 54 94 Q 60 72 82 72 Q 100 54 122 72 Q 146 72 152 96 Q 172 100 172 118 Q 172 138 150 138 Z"
            fill={accent}
            opacity="0.9"
          />
          {/* Up arrow inside */}
          <path
            d="M 100 88 L 100 122 M 100 88 L 88 100 M 100 88 L 112 100"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="86"
            y="120"
            width="28"
            height="4"
            rx="2"
            fill="#ffffff"
          />
        </svg>
      );

    case "tickets":
      // Chat bubble
      return (
        <svg {...common}>
          <ellipse cx="100" cy="175" rx="58" ry="6" fill={accent} opacity="0.1" />
          {/* Back bubble */}
          <path
            d="M 50 50 Q 38 50 38 62 L 38 118 Q 38 130 50 130 L 70 130 L 80 145 L 90 130 L 150 130 Q 162 130 162 118 L 162 62 Q 162 50 150 50 Z"
            fill={accent}
            opacity="0.25"
            transform="translate(10 -8)"
          />
          {/* Front bubble */}
          <path
            d="M 45 55 Q 32 55 32 68 L 32 122 Q 32 135 45 135 L 78 135 L 90 152 L 102 135 L 155 135 Q 168 135 168 122 L 168 68 Q 168 55 155 55 Z"
            fill={accent}
            opacity="0.9"
          />
          {/* Dots */}
          <circle cx="72" cy="95" r="6" fill="#ffffff" />
          <circle cx="100" cy="95" r="6" fill="#ffffff" opacity="0.85" />
          <circle cx="128" cy="95" r="6" fill="#ffffff" opacity="0.7" />
        </svg>
      );

    case "default":
    default:
      // Package box
      return (
        <svg {...common}>
          <ellipse cx="100" cy="172" rx="60" ry="7" fill={accent} opacity="0.1" />
          {/* Box top (lid) */}
          <path
            d="M 100 50 L 160 75 L 100 100 L 40 75 Z"
            fill={accent}
            opacity="0.55"
          />
          {/* Box left face */}
          <path
            d="M 40 75 L 100 100 L 100 160 L 40 135 Z"
            fill={accent}
            opacity="0.9"
          />
          {/* Box right face */}
          <path
            d="M 160 75 L 100 100 L 100 160 L 160 135 Z"
            fill={accent}
            opacity="0.7"
          />
          {/* Tape on top */}
          <path
            d="M 70 62 L 130 87 L 130 92 L 70 67 Z"
            fill="#ffffff"
            opacity="0.35"
          />
          {/* Center seam */}
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="160"
            stroke="#ffffff"
            strokeOpacity="0.4"
            strokeWidth="1.5"
          />
        </svg>
      );
  }
}

export default function EmptyState({
  variant = "default",
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center gap-4 py-12 px-4"
      style={{ color: "var(--text-muted)" }}
    >
      <Illustration variant={variant} />
      <h3
        className="text-lg font-bold"
        style={{ color: "var(--text)" }}
      >
        {title}
      </h3>
      {description ? (
        <p
          className="max-w-md text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          {description}
        </p>
      ) : null}
      {action ? (
        <Link
          href={action.href}
          className="mt-2 inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{
            background: "var(--accent)",
            color: "#ffffff",
          }}
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
