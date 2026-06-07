'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/actions/auth';

const MENU = [
  { href: '/dashboard', label: 'Overview', icon: '⚡' },
  { href: '/dashboard/hosting', label: 'Hosting', icon: '🌐' },
  { href: '/dashboard/dns', label: 'DNS Manager', icon: '🌍' },
  { href: '/dashboard/backup', label: 'Backup', icon: '💾' },
  { href: '/dashboard/cpanel', label: 'cPanel', icon: '🛠️' },
  { href: '/dashboard/invoice', label: 'Invoice', icon: '📄' },
  { href: '/dashboard/tickets', label: 'Bantuan', icon: '🎫' },
  { href: '/dashboard/profile', label: 'Profil', icon: '👤' },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:block sticky top-0 h-screen overflow-y-auto py-5"
      style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border)' }}
    >
      <Link href="/" className="flex items-center gap-2.5 font-extrabold text-xl px-6 pb-5 mb-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <span
          className="w-8 h-8 rounded-lg grid place-items-center text-white"
          style={{ background: 'var(--gradient)' }}
        >
          Z
        </span>
        <span>Zentra</span>
      </Link>

      <nav className="px-3">
        {MENU.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium mb-1 transition-all"
            style={{
              color: pathname === m.href ? 'var(--accent)' : 'var(--text-muted)',
              background: pathname === m.href ? 'rgba(20,184,166,0.1)' : 'transparent',
            }}
          >
            <span className="text-base">{m.icon}</span>
            {m.label}
          </Link>
        ))}

        <Link
          href="/paket"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium mb-1"
          style={{ color: 'var(--text-muted)' }}
        >
          <span className="text-base">🛍️</span>
          Beli Paket
        </Link>

        <form action={logout}>
          <button
            type="submit"
            className="w-full text-left flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium cursor-pointer border-0 bg-transparent"
            style={{ color: 'var(--text-muted)', fontFamily: 'inherit' }}
          >
            <span className="text-base">↪</span>
            Keluar
          </button>
        </form>
      </nav>
    </aside>
  );
}
