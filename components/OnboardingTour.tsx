'use client';

import { useState, useEffect } from 'react';

interface TourStep {
  title: string;
  description: string;
  icon: string;
}

const STEPS: TourStep[] = [
  {
    title: 'Selamat Datang di Zentra Host! 👋',
    description:
      'Yuk kita tour sebentar untuk mengenal fitur-fitur utama dashboard kamu. Hanya butuh waktu kurang dari 1 menit kok!',
    icon: '🎉',
  },
  {
    title: 'Overview Stats',
    description:
      'Lihat semua stats hosting kamu di sini — mulai dari jumlah layanan aktif, traffic, sampai status pembayaran terbaru.',
    icon: '📊',
  },
  {
    title: 'Beli Paket Baru',
    description:
      'Klik "Beli Paket" di sidebar untuk mulai memilih paket hosting, domain, atau VPS sesuai kebutuhan kamu.',
    icon: '🛒',
  },
  {
    title: 'Quick Actions',
    description:
      'Akses cepat ke fitur yang sering dipakai seperti cPanel, kelola DNS, backup, dan tracking pesanan.',
    icon: '⚡',
  },
  {
    title: 'Bantuan 24/7',
    description:
      'Butuh bantuan? Klik tombol WhatsApp di pojok kanan bawah atau buka tiket support — tim kami siap 24/7.',
    icon: '💬',
  },
  {
    title: 'Selesai!',
    description:
      'Kamu sudah siap! Selamat menikmati layanan hosting terbaik Indonesia bersama Zentra Host. 🚀',
    icon: '🏆',
  },
];

interface OnboardingTourProps {
  open: boolean;
  onClose: () => void;
}

export default function OnboardingTour({ open, onClose }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [animateContent, setAnimateContent] = useState(false);

  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      setAnimateContent(true);
    }
  }, [open]);

  useEffect(() => {
    setAnimateContent(false);
    const t = setTimeout(() => setAnimateContent(true), 30);
    return () => clearTimeout(t);
  }, [currentStep]);

  if (!open) return null;

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (isLast) {
      handleFinish();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleFinish = () => {
    try {
      localStorage.setItem('onboarding_completed', 'true');
    } catch {}
    onClose();
  };

  return (
    <>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes slideContent {
          from {
            opacity: 0;
            transform: translateX(24px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes meshShift {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -20px) scale(1.05);
          }
          66% {
            transform: translate(-20px, 30px) scale(0.97);
          }
        }
        @keyframes iconBounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .ob-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: grid;
          place-items: center;
          padding: 16px;
          background: rgba(8, 10, 20, 0.65);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          animation: fadeIn 0.3s ease-out;
        }
        .ob-mesh {
          position: absolute;
          inset: -20%;
          background:
            radial-gradient(circle at 20% 30%, rgba(124, 92, 255, 0.35), transparent 40%),
            radial-gradient(circle at 80% 20%, rgba(255, 92, 168, 0.3), transparent 45%),
            radial-gradient(circle at 50% 80%, rgba(92, 200, 255, 0.3), transparent 45%),
            radial-gradient(circle at 90% 90%, rgba(255, 184, 92, 0.25), transparent 40%);
          filter: blur(40px);
          opacity: 0.5;
          animation: meshShift 12s ease-in-out infinite;
          pointer-events: none;
        }
        .ob-modal {
          position: relative;
          width: 100%;
          max-width: 28rem;
          border-radius: 24px;
          padding: 2px;
          background: linear-gradient(
            135deg,
            rgba(124, 92, 255, 0.9),
            rgba(255, 92, 168, 0.8),
            rgba(92, 200, 255, 0.85)
          );
          background-size: 200% 200%;
          animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 30px 80px -20px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(255, 255, 255, 0.05);
        }
        .ob-card {
          position: relative;
          border-radius: 22px;
          background: var(--bg-card, #ffffff);
          padding: 32px 28px 24px;
          overflow: hidden;
        }
        .ob-icon {
          font-size: 64px;
          line-height: 1;
          text-align: center;
          margin-bottom: 16px;
          animation: iconBounce 2.4s ease-in-out infinite;
        }
        .ob-title {
          font-size: 22px;
          font-weight: 800;
          text-align: center;
          letter-spacing: -0.5px;
          margin-bottom: 12px;
          color: var(--text, #0b0d17);
        }
        .ob-desc {
          font-size: 14.5px;
          line-height: 1.6;
          text-align: center;
          color: var(--text-muted, #5b6275);
          margin-bottom: 24px;
          min-height: 70px;
        }
        .ob-anim {
          animation: slideContent 0.35s ease-out;
        }
        .ob-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 24px;
        }
        .ob-dot {
          height: 8px;
          border-radius: 999px;
          background: var(--border, #e2e5ee);
          transition: all 0.3s ease;
        }
        .ob-dot.active {
          width: 28px;
          background: linear-gradient(90deg, #7c5cff, #ff5ca8);
        }
        .ob-dot.inactive {
          width: 8px;
        }
        .ob-dot.done {
          width: 8px;
          background: linear-gradient(90deg, #7c5cff, #ff5ca8);
          opacity: 0.5;
        }
        .ob-progress {
          height: 4px;
          width: 100%;
          background: var(--border, #e2e5ee);
          border-radius: 999px;
          overflow: hidden;
          margin-bottom: 20px;
        }
        .ob-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #7c5cff, #ff5ca8, #5cc8ff);
          border-radius: 999px;
          transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .ob-actions {
          display: flex;
          gap: 12px;
          justify-content: space-between;
          align-items: center;
        }
        .ob-btn {
          flex: 1;
          padding: 12px 18px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }
        .ob-btn-ghost {
          background: transparent;
          color: var(--text-muted, #5b6275);
          border: 1px solid var(--border, #e2e5ee);
        }
        .ob-btn-ghost:hover {
          background: var(--bg, #f5f6fa);
          color: var(--text, #0b0d17);
        }
        .ob-btn-primary {
          background: linear-gradient(135deg, #7c5cff, #ff5ca8);
          color: #fff;
          box-shadow: 0 8px 20px -6px rgba(124, 92, 255, 0.5);
        }
        .ob-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 24px -6px rgba(124, 92, 255, 0.6);
        }
        .ob-step-label {
          text-align: center;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--text-muted, #8a8fa3);
          margin-bottom: 8px;
        }
      `}</style>

      <div className="ob-overlay" role="dialog" aria-modal="true" aria-labelledby="ob-title">
        <div className="ob-modal">
          <div className="ob-card">
            <div className="ob-mesh" />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div className="ob-step-label">
                Langkah {currentStep + 1} dari {STEPS.length}
              </div>

              <div className="ob-progress">
                <div className="ob-progress-bar" style={{ width: `${progress}%` }} />
              </div>

              <div className={animateContent ? 'ob-anim' : ''} key={currentStep}>
                <div className="ob-icon">{step.icon}</div>
                <h2 id="ob-title" className="ob-title">
                  {step.title}
                </h2>
                <p className="ob-desc">{step.description}</p>
              </div>

              <div className="ob-dots" role="tablist">
                {STEPS.map((_, i) => (
                  <span
                    key={i}
                    className={`ob-dot ${
                      i === currentStep ? 'active' : i < currentStep ? 'done' : 'inactive'
                    }`}
                  />
                ))}
              </div>

              <div className="ob-actions">
                <button
                  type="button"
                  className="ob-btn ob-btn-ghost"
                  onClick={handleFinish}
                >
                  Skip Tour
                </button>
                <button
                  type="button"
                  className="ob-btn ob-btn-primary"
                  onClick={handleNext}
                >
                  {isLast ? 'Finish 🎉' : 'Next →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
