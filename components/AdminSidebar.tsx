'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/actions/auth';

const MENU = [
  { href: '/admin', label: 'Overview', icon: '📊' },
  { href: '/admin/orders', label: 'Orders', icon: '🛒' },
  { href: '/admin/customers', label: 'Customers', icon: '👥' },
  { href: '/admin/payments', label: 'Payments', icon: '💳' },
  { href: '/admin/tickets', label: 'Tickets', icon: '🎫' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:block sticky top-0 h-screen overflow-y-auto py-5"
      style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border)' }}
    >
      <Link
        href="/admin"
        className="flex items-center gap-2.5 font-extrabold text-xl px-6 pb-5 mb-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <span
          className="w-8 h-8 rounded-lg grid place-items-center text-white"
          style={{ background: 'var(--gradient)' }}
        >
          Z
        </span>
        <span className="flex items-center gap-2">
          Zentra
          <span
            className="text-[10px] font-extrabold px-2 py-0.5 rounded-md text-white tracking-wider"
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
              boxShadow: '0 0 10px rgba(239,68,68,0.4)',
            }}
          >
            ADMIN
          </span>
        </span>
      </Link>

      <nav className="px-3">
        {MENU.map((m) => {
          const active = m.href === '/admin' ? pathname === '/admin' : pathname.startsWith(m.href);
          return (
            <Link
              key={m.href}
              href={m.href}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium mb-1 transition-all"
              style={{
                color: active ? 'var(--accent)' : 'var(--text-muted)',
                background: active ? 'rgba(20,184,166,0.1)' : 'transparent',
              }}
            >
              <span className="text-base">{m.icon}</span>
              {m.label}
            </Link>
          );
        })}

        <div className="my-3" style={{ borderTop: '1px solid var(--border)' }} />

        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium mb-1"
          style={{ color: 'var(--text-muted)' }}
        >
          <span className="text-base">↩️</span>
          Kembali ke Dashboard
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
