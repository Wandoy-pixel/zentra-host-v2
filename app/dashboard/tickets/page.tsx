import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { timeAgo } from '@/lib/data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tiket Bantuan',
  description: 'Kelola tiket support dan dapatkan bantuan dari tim Zentra Host.',
};

type Ticket = {
  id: number;
  subject: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string | null;
};

const CATEGORY_META: Record<string, { label: string; color: string; bg: string }> = {
  billing: { label: '💳 Billing', color: 'var(--warning)', bg: 'rgba(245,158,11,0.15)' },
  technical: { label: '🛠️ Technical', color: 'var(--accent)', bg: 'rgba(20,184,166,0.15)' },
  sales: { label: '🛍️ Sales', color: 'var(--secondary)', bg: 'rgba(99,102,241,0.15)' },
  abuse: { label: '⚠️ Abuse', color: 'var(--danger)', bg: 'rgba(239,68,68,0.15)' },
  other: { label: '📝 Lainnya', color: 'var(--text-muted)', bg: 'rgba(139,147,167,0.15)' },
};

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  open: { label: 'Open', color: '#34d399', bg: 'rgba(16,185,129,0.15)' },
  pending: { label: 'Pending', color: '#fbbf24', bg: 'rgba(245,158,11,0.15)' },
  answered: { label: 'Answered', color: '#818cf8', bg: 'rgba(99,102,241,0.15)' },
  closed: { label: 'Closed', color: '#f87171', bg: 'rgba(239,68,68,0.15)' },
};

const PRIORITY_META: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: '↓ Low', color: 'var(--text-muted)', bg: 'rgba(139,147,167,0.15)' },
  normal: { label: '○ Normal', color: 'var(--accent)', bg: 'rgba(20,184,166,0.12)' },
  high: { label: '↑ High', color: 'var(--warning)', bg: 'rgba(245,158,11,0.15)' },
  urgent: { label: '⚡ Urgent', color: 'var(--danger)', bg: 'rgba(239,68,68,0.15)' },
};

function Badge({ meta }: { meta: { label: string; color: string; bg: string } }) {
  return (
    <span
      className="inline-block px-2.5 py-1 rounded-full text-xs font-bold tracking-wide"
      style={{ background: meta.bg, color: meta.color }}
    >
      {meta.label}
    </span>
  );
}

export default async function TicketsListPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: tickets } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  const list = (tickets || []) as Ticket[];

  const openCount = list.filter((t) => t.status === 'open' || t.status === 'pending').length;
  const closedCount = list.filter((t) => t.status === 'closed').length;
  const answeredCount = list.filter((t) => t.status === 'answered').length;

  return (
    <>
      <div className="card mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold mb-1">🎫 Tiket Bantuan</h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Ada masalah? Tim support kami siap bantu 24/7.
          </p>
        </div>
        <Link href="/dashboard/tickets/new" className="btn btn-primary">
          + Buat Tiket Baru
        </Link>
      </div>

      {list.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { ic: '🎫', val: list.length, label: 'Total Tiket', bg: 'rgba(20,184,166,0.1)', cl: 'var(--accent)' },
            { ic: '🟢', val: openCount, label: 'Open / Pending', bg: 'rgba(16,185,129,0.1)', cl: 'var(--success)' },
            { ic: '💬', val: answeredCount, label: 'Dibalas Support', bg: 'rgba(99,102,241,0.1)', cl: 'var(--secondary)' },
            { ic: '✅', val: closedCount, label: 'Selesai', bg: 'rgba(139,147,167,0.1)', cl: 'var(--text-muted)' },
          ].map((s) => (
            <div key={s.label} className="card transition-all hover:-translate-y-1">
              <div
                className="w-10 h-10 rounded-xl grid place-items-center text-lg mb-3"
                style={{ background: s.bg, color: s.cl }}
              >
                {s.ic}
              </div>
              <h2 className="font-extrabold text-2xl">{s.val}</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {list.length === 0 ? (
        <div className="card text-center py-12" style={{ color: 'var(--text-muted)' }}>
          <div className="text-5xl mb-3">📭</div>
          <h3 className="font-semibold mb-2 text-lg" style={{ color: 'var(--text)' }}>
            Belum ada tiket
          </h3>
          <p className="text-sm mb-5 max-w-md mx-auto">
            Kalau kamu butuh bantuan teknis, billing, atau pertanyaan lain — tim support kami siap membantu.
            Buat tiket pertamamu sekarang.
          </p>
          <Link href="/dashboard/tickets/new" className="btn btn-primary">
            + Buat Tiket Pertama
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {list.map((t) => {
            const cat = CATEGORY_META[t.category] || CATEGORY_META.other;
            const st = STATUS_META[t.status] || STATUS_META.open;
            const pr = PRIORITY_META[t.priority] || PRIORITY_META.normal;
            const ticketNo = 'TKT-' + String(t.id).padStart(6, '0');
            const lastUpdate = t.updated_at || t.created_at;

            return (
              <Link
                key={t.id}
                href={`/dashboard/tickets/${t.id}`}
                className="card block transition-all hover:-translate-y-0.5"
                style={{
                  borderLeft: `3px solid ${pr.color}`,
                }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span className="font-mono">{ticketNo}</span>
                      <span>•</span>
                      <span>{timeAgo(lastUpdate)}</span>
                    </div>
                    <h4 className="font-bold text-base mb-2 truncate">{t.subject}</h4>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge meta={st} />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge meta={cat} />
                  <Badge meta={pr} />
                  <span className="ml-auto text-xs flex items-center gap-1" style={{ color: 'var(--accent)' }}>
                    Lihat detail →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
