'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import type { User } from '@supabase/supabase-js';

const NAV_ITEMS = [
  { href: '/', label: 'Beranda' },
  { href: '/paket', label: 'Paket' },
  { href: '/domain', label: 'Domain' },
  { href: '/kontak', label: 'Kontak' },
];

export default function Navbar({ user }: { user: User | null }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: 'var(--navbar-bg)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="max-w-[1240px] mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-extrabold text-xl">
          <span
            className="w-8 h-8 rounded-lg grid place-items-center text-white text-lg"
            style={{ background: 'var(--gradient)', boxShadow: '0 4px 16px rgba(20,184,166,0.4)' }}
          >
            Z
          </span>
          <span>Zentra</span>
        </Link>

        <ul className={`${mobileOpen ? 'flex' : 'hidden'} md:flex gap-2 absolute md:relative top-[65px] md:top-0 left-0 md:left-auto right-0 md:right-auto flex-col md:flex-row p-5 md:p-0 z-50`}
          style={mobileOpen ? { background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' } : undefined}>
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors block ${
                  pathname === item.href ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'
                }`}
                style={pathname === item.href ? { background: 'rgba(255,255,255,0.05)' } : undefined}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex gap-2.5 items-center">
          <ThemeToggle />
          {user ? (
            <Link href="/dashboard" className="btn btn-primary">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost hidden sm:inline-flex">
                Masuk
              </Link>
              <Link href="/register" className="btn btn-primary">
                Mulai Gratis →
              </Link>
            </>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden grid place-items-center text-base cursor-pointer rounded-lg"
            style={{
              width: 38,
              height: 38,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
          >
            ☰
          </button>
        </div>
      </div>
    </nav>
  );
}
