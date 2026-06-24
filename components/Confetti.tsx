"use client";

import { useCallback } from "react";

/**
 * Confetti & Sparkle animation component
 * Pure JS canvas — no external library needed.
 *
 * Usage:
 *   import { fireConfetti, fireSparkle, useConfetti } from "@/components/Confetti";
 *
 *   // Direct call:
 *   fireConfetti();
 *   fireSparkle();
 *
 *   // Via hook:
 *   const { fire, sparkle } = useConfetti();
 *   <button onClick={fire}>Celebrate</button>
 */

const CONFETTI_COLORS = [
  "#14b8a6", // teal
  "#6366f1", // indigo
  "#ec4899", // pink
  "#fbbf24", // amber
  "#10b981", // emerald
];

const SPARKLE_COLORS = [
  "#fef3c7", // soft amber
  "#a5f3fc", // soft cyan
  "#e9d5ff", // soft purple
  "#fce7f3", // soft pink
  "#ffffff", // white
];

type ConfettiParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  shape: "rect" | "circle";
  alpha: number;
};

type SparkleParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  twinkle: number;
};

function createOverlayCanvas(): HTMLCanvasElement | null {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "9999";

  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;

  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.scale(dpr, dpr);
  }

  return canvas;
}

/**
 * Fire a burst of confetti from the top of the screen.
 * Animates falling pieces with gravity, rotation, and fade out.
 * Cleans up after ~3 seconds.
 */
export function fireConfetti(options?: {
  particleCount?: number;
  duration?: number;
}): void {
  const canvas = createOverlayCanvas();
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const particleCount = options?.particleCount ?? 120;
  const duration = options?.duration ?? 3000;

  const particles: ConfettiParticle[] = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: width / 2 + (Math.random() - 0.5) * width * 0.6,
      y: -20 - Math.random() * 100,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * 3 + 2,
      size: Math.random() * 8 + 4,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
      color:
        CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      shape: Math.random() > 0.5 ? "rect" : "circle",
      alpha: 1,
    });
  }

  const gravity = 0.18;
  const drag = 0.995;
  const start = performance.now();
  let rafId = 0;

  const animate = (now: number) => {
    const elapsed = now - start;
    const fadeStart = duration * 0.6;

    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      // physics
      p.vy += gravity;
      p.vx *= drag;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;

      // fade out in the last 40% of the animation
      if (elapsed > fadeStart) {
        p.alpha = Math.max(0, 1 - (elapsed - fadeStart) / (duration - fadeStart));
      }

      // draw
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;

      if (p.shape === "rect") {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    if (elapsed < duration) {
      rafId = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(rafId);
      canvas.remove();
    }
  };

  rafId = requestAnimationFrame(animate);
}

/**
 * Fire a subtle sparkle effect — small twinkling dots that drift upward.
 * More elegant than confetti, good for subtle success cues.
 */
export function fireSparkle(options?: {
  particleCount?: number;
  duration?: number;
  origin?: { x: number; y: number };
}): void {
  const canvas = createOverlayCanvas();
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const particleCount = options?.particleCount ?? 50;
  const duration = options?.duration ?? 2500;
  const origin = options?.origin ?? { x: width / 2, y: height / 2 };

  const particles: SparkleParticle[] = [];
  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3 + 0.5;
    particles.push({
      x: origin.x + (Math.random() - 0.5) * 40,
      y: origin.y + (Math.random() - 0.5) * 40,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1, // slight upward bias
      size: Math.random() * 2.5 + 1,
      color:
        SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)],
      alpha: 1,
      twinkle: Math.random() * Math.PI * 2,
    });
  }

  const gravity = 0.02; // very light — sparkles float
  const drag = 0.98;
  const start = performance.now();
  let rafId = 0;

  const animate = (now: number) => {
    const elapsed = now - start;
    const fadeStart = duration * 0.3;

    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      p.vy += gravity;
      p.vx *= drag;
      p.vy *= drag;
      p.x += p.vx;
      p.y += p.vy;
      p.twinkle += 0.2;

      // twinkle: alpha modulates with sine wave
      const twinkleAlpha = 0.6 + 0.4 * Math.sin(p.twinkle);
      let baseAlpha = 1;
      if (elapsed > fadeStart) {
        baseAlpha = Math.max(
          0,
          1 - (elapsed - fadeStart) / (duration - fadeStart),
        );
      }
      p.alpha = baseAlpha * twinkleAlpha;

      // draw glow + dot
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (elapsed < duration) {
      rafId = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(rafId);
      canvas.remove();
    }
  };

  rafId = requestAnimationFrame(animate);
}

/**
 * Convenience hook — returns stable callbacks to trigger confetti & sparkle.
 *
 * @example
 *   const { fire, sparkle } = useConfetti();
 *   <button onClick={fire}>Yay!</button>
 */
export function useConfetti() {
  const fire = useCallback(
    (options?: { particleCount?: number; duration?: number }) => {
      fireConfetti(options);
    },
    [],
  );

  const sparkle = useCallback(
    (options?: {
      particleCount?: number;
      duration?: number;
      origin?: { x: number; y: number };
    }) => {
      fireSparkle(options);
    },
    [],
  );

  return { fire, sparkle };
}

export default useConfetti;
