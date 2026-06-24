"use client";

import { useEffect, useState } from "react";

interface Purchase {
  name: string;
  location: string;
  product: string;
  emoji: string;
}

const PURCHASES: Purchase[] = [
  { name: "Budi", location: "Jakarta", product: "Business", emoji: "👨‍💼" },
  { name: "Sari", location: "Bandung", product: "Cloud M", emoji: "👩‍💻" },
  { name: "Rio", location: "Surabaya", product: "VPS Pro", emoji: "👨‍🔧" },
  { name: "Linda", location: "Yogyakarta", product: "Domain .id", emoji: "👩‍🏫" },
  { name: "Andi", location: "Medan", product: "Starter", emoji: "🧑‍💻" },
];

const SHOW_INTERVAL_MS = 15000;
const VISIBLE_MS = 5000;

export default function RecentPurchase() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    let hideTimeout: ReturnType<typeof setTimeout> | null = null;

    // Show first one a bit after mount
    const firstShow = setTimeout(() => {
      setVisible(true);
      hideTimeout = setTimeout(() => setVisible(false), VISIBLE_MS);
    }, 3000);

    const intervalId = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % PURCHASES.length);
      setVisible(true);
      if (hideTimeout) clearTimeout(hideTimeout);
      hideTimeout = setTimeout(() => setVisible(false), VISIBLE_MS);
    }, SHOW_INTERVAL_MS);

    return () => {
      clearTimeout(firstShow);
      clearInterval(intervalId);
      if (hideTimeout) clearTimeout(hideTimeout);
    };
  }, []);

  const purchase = PURCHASES[currentIndex];

  return (
    <div
      onClick={() => setVisible(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setVisible(false);
      }}
      aria-hidden={!visible}
      className="fixed z-[60] cursor-pointer select-none"
      style={{
        left: 20,
        bottom: 20,
        maxWidth: 320,
        transform: visible ? "translateY(0)" : "translateY(140%)",
        opacity: visible ? 1 : 0,
        transition:
          "transform 500ms cubic-bezier(0.22, 1, 0.36, 1), opacity 400ms ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div
        className="rounded-2xl p-[1px]"
        style={{
          background:
            "linear-gradient(135deg, rgba(20,184,166,0.85), rgba(124,58,237,0.85))",
          boxShadow: "0 18px 40px -12px rgba(0,0,0,0.45)",
        }}
      >
        <div
          className="rounded-2xl flex items-center gap-3 p-3 pr-4"
          style={{
            background: "var(--bg-card, #111827)",
            color: "var(--text, #f3f4f6)",
          }}
        >
          <div
            className="w-11 h-11 rounded-xl grid place-items-center text-2xl flex-shrink-0"
            style={{
              background: "rgba(20,184,166,0.12)",
              border: "1px solid rgba(20,184,166,0.30)",
            }}
            aria-hidden="true"
          >
            {purchase.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold leading-tight">
              {purchase.name} dari {purchase.location}
            </div>
            <div
              className="text-xs mt-0.5 leading-snug"
              style={{ color: "var(--text-muted, #9ca3af)" }}
            >
              baru saja membeli{" "}
              <span style={{ color: "#14b8a6", fontWeight: 600 }}>
                {purchase.product}
              </span>
            </div>
            <div
              className="text-[10px] mt-1 flex items-center gap-1"
              style={{ color: "var(--text-muted, #9ca3af)" }}
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ background: "#10b981" }}
              />
              Just now
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setVisible(false);
            }}
            aria-label="Tutup notifikasi"
            className="w-6 h-6 rounded-full grid place-items-center text-xs flex-shrink-0"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "var(--text-muted, #9ca3af)",
            }}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
