'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import OnboardingTour from './OnboardingTour';

export default function OnboardingTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!pathname || !pathname.includes('/dashboard')) return;

    try {
      const completed = localStorage.getItem('onboarding_completed');
      if (completed !== 'true') {
        const t = setTimeout(() => setIsOpen(true), 600);
        return () => clearTimeout(t);
      }
    } catch {
      // localStorage tidak tersedia (private mode dsb) — abaikan
    }
  }, [pathname]);

  const handleClose = () => setIsOpen(false);

  return <OnboardingTour open={isOpen} onClose={handleClose} />;
}
