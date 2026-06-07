import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { adminUpdateTicketStatus } from '@/app/actions/admin';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin · Tickets — Zentra Host',
  description: 'Kelola support tickets dari customer.',
};

const STATUS_FILTERS: Array<{ key: string; label: string; color: string }> = [
  { key: 'all', label: 'Semua', color: 'var(--text-muted)' },
  { key: 'open', label: 'Open', color: 'var(--warning)' },
  { key: 'pending', label: 'Pending', color: 'var(--secondary)' },
  { key: 'resolved', label: 'Resolved', color: 'var(--success)' },
  { key: 'closed', label: 'Closed', color: 'var(--text-muted)' },
];

const PRIORITY_COLORS: Record<string, string> = {
  low: 'rgba(99,102,241,0.15)',
  normal: 'rgba(20,184,166,0.15)',
  high: 'rgba(245,158,11,0.15)',
  urgent: 'rgba(239,68,68,0.15)',
};

const PRIORITY_TEXT: Record<string, string> = {
  low: 'var(--secondary)',
  normal: 'var(--accent)',
  high: 'var(--warning)',
  urgent: '#ef4444',
};

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const supabase = createClient();

  // DOUBLE-CHECK role admin (server-side, jangan trust client)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (!profile || profile.role !== 'admin') redirect('/dashboard');

  const status = searchParams?.status || 'all';

  let query = supabase
    .from('tickets')
    .select('id, subject, status, priority, created_at, user_id, profiles(fullname)')
    .order('created_at', { ascending: false });

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  const { data: tickets, error } = await query.limit(200);

  // Stats per status (overall, bukan filtered)
  const { data: allTickets } = await supabase
    .from('tickets')
    .select('status');

  const statusCount: Record<string, number> = { open: 0, pending: 0, resolved: 0, closed: 0 };
  (allTickets || []).forEach((t: any) => {
    if (statusCount[t.status] !== undefined) statusCount[t.status] += 1;
  });

  const list = tickets || [];

  async function updateStatusAction(formData: FormData) {
    'use server';
    const id = Number(formData.get('ticketId'));
    const newStatus = String(formData.get('status') || '') as
      | 'open'
      | 'pending'
      | 'resolved'
      | 'closed';
    if (!id || !newStatus) return;
    await adminUpdateTicketStatus(id, newStatus);
  }

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            🟡 Open
          </p>
          <h2 className="font-extrabold text-2xl" style={{ color: 'var(--warning)' }}>
            {statusCount.open}
          </h2>
        </div>
        <div className="card">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            🔵 Pending
          </p>
          <h2 className="font-extrabold text-2xl" style={{ color: 'var(--secondary)' }}>
            {statusCount.pending}
          </h2>
        </div>
        <div className="card">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            🟢 Resolved
          </p>
          <h2 className="font-extrabold text-2xl" style={{ color: 'var(--success)' }}>
            {statusCount.resolved}
          </h2>
        </div>
        <div className="card">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            ⚪ Closed
          </p>
          <h2 className="font-extrabold text-2xl" style={{ color: 'var(--text-muted)' }}>
            {statusCount.closed}
          </h2>
        </div>
      </div>

      {/* Filter */}
      <div className="card mb-6">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <h3 className="text-lg font-bold">🎫 Support Tickets</h3>
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <Link
                key={f.key}
                href={`/admin/tickets?status=${f.key}`}
                className="text-xs font-semibold px-3 py-2 rounded-lg uppercase tracking-wider"
                style={{
                  background:
                    status === f.key ? 'rgba(20,184,166,0.15)' : 'rgba(255,255,255,0.04)',
                  color: status === f.key ? 'var(--accent)' : f.color,
                  border: '1px solid var(--border)',
                }}
              >
                {f.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {error ? (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            <div className="text-5xl mb-3">⚠️</div>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--text)' }}>
              Table `tickets` belum tersedia
            </h3>
            <p className="text-sm mb-2">Pastikan tabel <code>tickets</code> sudah dibuat di Supabase.</p>
            <p className="text-[11px] opacity-70">{error.message}</p>
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            <div className="text-5xl mb-3">📭</div>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--text)' }}>
              Tidak ada ticket untuk filter ini
            </h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ color: 'var(--text-muted)' }}>
                  <th className="text-left py-3 px-4 uppercase text-xs tracking-wider font-semibold">
                    ID
                  </th>
                  <th className="text-left py-3 px-4 uppercase text-xs tracking-wider font-semibold">
                    Subject
                  </th>
                  <th className="text-left py-3 px-4 uppercase text-xs tracking-wider font-semibold">
                    Customer
                  </th>
                  <th className="text-left py-3 px-4 uppercase text-xs tracking-wider font-semibold">
                    Priority
                  </th>
                  <th className="text-left py-3 px-4 uppercase text-xs tracking-wider font-semibold">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 uppercase text-xs tracking-wider font-semibold">
                    Created
                  </th>
                  <th className="text-left py-3 px-4 uppercase text-xs tracking-wider font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.map((t: any) => {
                  const prio = (t.priority || 'normal').toLowerCase();
                  return (
                    <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="py-3 px-4 font-mono text-xs">
                        #{String(t.id).padStart(5, '0')}
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        <Link
                          href={`/admin/tickets/${t.id}`}
                          style={{ color: 'var(--text)' }}
                          className="hover:underline"
                        >
                          {t.subject || '(no subject)'}
                        </Link>
                      </td>
                      <td className="py-3 px-4">{t.profiles?.fullname || '—'}</td>
                      <td className="py-3 px-4">
                        <span
                          className="text-[10px] font-bold px-2 py-1 rounded-md uppercase"
                          style={{
                            background: PRIORITY_COLORS[prio] || PRIORITY_COLORS.normal,
                            color: PRIORITY_TEXT[prio] || PRIORITY_TEXT.normal,
                          }}
                        >
                          {prio}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="text-[10px] font-bold px-2 py-1 rounded-md uppercase"
                          style={{
                            background:
                              t.status === 'open'
                                ? 'rgba(245,158,11,0.15)'
                                : t.status === 'pending'
                                  ? 'rgba(99,102,241,0.15)'
                                  : t.status === 'resolved'
                                    ? 'rgba(16,185,129,0.15)'
                                    : 'rgba(148,163,184,0.15)',
                            color:
                              t.status === 'open'
                                ? 'var(--warning)'
                                : t.status === 'pending'
                                  ? 'var(--secondary)'
                                  : t.status === 'resolved'
                                    ? 'var(--success)'
                                    : 'var(--text-muted)',
                          }}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                        {new Date(t.created_at).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2 items-center flex-wrap">
                          <Link
                            href={`/admin/tickets/${t.id}`}
                            className="text-xs px-2 py-1 rounded-md"
                            style={{
                              background: 'rgba(99,102,241,0.1)',
                              color: 'var(--secondary)',
                              border: '1px solid rgba(99,102,241,0.2)',
                            }}
                          >
                            View
                          </Link>
                          {t.status !== 'resolved' && (
                            <form action={updateStatusAction}>
                              <input type="hidden" name="ticketId" value={t.id} />
                              <input type="hidden" name="status" value="resolved" />
                              <button
                                type="submit"
                                className="text-xs px-2 py-1 rounded-md cursor-pointer"
                                style={{
                                  background: 'rgba(16,185,129,0.1)',
                                  color: 'var(--success)',
                                  border: '1px solid rgba(16,185,129,0.2)',
                                  fontFamily: 'inherit',
                                }}
                              >
                                Resolve
                              </button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
