import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { timeAgo, fmtDate } from '@/lib/data';
import { addReplyForm } from '@/app/actions/support';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Detail Tiket',
  description: 'Lihat detail tiket support dan balas thread percakapan.',
};

type Ticket = {
  id: number;
  user_id: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string | null;
};

type Message = {
  id: number;
  ticket_id: number;
  user_id: string | null;
  author_role: string;
  message: string;
  created_at: string;
};

const CATEGORY_META: Record<string, { label: string; color: string; bg: string }> = {
  billing: { label: '💳 Billing', color: 'var(--warning)', bg: 'rgba(245,158,11,0.15)' },
  technical: { label: '🛠️ Technical', color: 'var(--accent)', bg: 'rgba(20,184,166,0.15)' },
  sales: { label: '🛍️ Sales', color: 'var(--secondary)', bg: 'rgba(99,102,241,0.15)' },
  abuse: { label: '⚠️ Abuse', color: 'var(--danger)', bg: 'rgba(239,68,68,0.15)' },
  other: { label: '📝 Lainnya', color: 'var(--text-muted)', bg: 'rgba(139,147,167,0.15)' },
};

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  open: { label: '🟢 Open', color: '#34d399', bg: 'rgba(16,185,129,0.15)' },
  pending: { label: '⏳ Pending', color: '#fbbf24', bg: 'rgba(245,158,11,0.15)' },
  answered: { label: '💬 Answered', color: '#818cf8', bg: 'rgba(99,102,241,0.15)' },
  closed: { label: '🔒 Closed', color: '#f87171', bg: 'rgba(239,68,68,0.15)' },
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

export default async function TicketDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  const ticketId = Number(params.id);
  if (!ticketId || isNaN(ticketId)) notFound();

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch ticket dengan ownership check
  const { data: ticket } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('id', ticketId)
    .eq('user_id', user.id)
    .single();

  if (!ticket) notFound();

  const t = ticket as Ticket;

  // Fetch profile user buat tampilin nama di bubble
  const { data: profile } = await supabase
    .from('profiles')
    .select('fullname')
    .eq('id', user.id)
    .single();

  const customerName =
    profile?.fullname ||
    (user.email ? user.email.split('@')[0] : 'Customer');

  // Fetch all messages, ordered ascending (chronological)
  const { data: messages } = await supabase
    .from('support_messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });

  const msgList = (messages || []) as Message[];

  const cat = CATEGORY_META[t.category] || CATEGORY_META.other;
  const st = STATUS_META[t.status] || STATUS_META.open;
  const pr = PRIORITY_META[t.priority] || PRIORITY_META.normal;
  const ticketNo = 'TKT-' + String(t.id).padStart(6, '0');
  const isClosed = t.status === 'closed';

  return (
    <>
      <div className="card mb-6">
        <div className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
          <Link href="/dashboard/tickets" className="hover:underline">
            ← Tiket Bantuan
          </Link>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="font-mono">{ticketNo}</span>
              <span>•</span>
              <span>Dibuat {fmtDate(t.created_at)}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold mb-3" style={{ letterSpacing: '-0.3px' }}>
              {t.subject}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <Badge meta={st} />
              <Badge meta={cat} />
              <Badge meta={pr} />
            </div>
          </div>
        </div>
      </div>

      {searchParams.error && (
        <div className="alert alert-error">{searchParams.error}</div>
      )}

      {/* Thread */}
      <div className="card mb-6">
        <h3 className="text-base font-bold mb-5 flex items-center gap-2">
          💬 Thread Percakapan
          <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
            ({msgList.length} pesan)
          </span>
        </h3>

        {msgList.length === 0 ? (
          <div className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>
            Belum ada pesan di tiket ini.
          </div>
        ) : (
          <div className="space-y-4">
            {msgList.map((m) => {
              const isAdmin = m.author_role === 'admin' || m.author_role === 'support';
              const authorName = isAdmin ? 'Admin Support' : customerName;
              const authorInitial = isAdmin ? 'A' : customerName.charAt(0).toUpperCase();
              const bubbleBg = isAdmin
                ? 'rgba(99,102,241,0.08)'
                : 'rgba(20,184,166,0.08)';
              const borderColor = isAdmin
                ? 'rgba(99,102,241,0.25)'
                : 'rgba(20,184,166,0.25)';
              const avatarBg = isAdmin
                ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                : 'var(--gradient)';

              return (
                <div
                  key={m.id}
                  className={`flex gap-3 ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className="w-10 h-10 rounded-full grid place-items-center text-white font-bold flex-shrink-0 text-sm"
                    style={{ background: avatarBg }}
                  >
                    {authorInitial}
                  </div>
                  <div className={`flex-1 min-w-0 ${isAdmin ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`flex items-center gap-2 mb-1.5 text-xs ${isAdmin ? 'justify-end' : 'justify-start'}`}
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <span className="font-semibold" style={{ color: 'var(--text)' }}>
                        {authorName}
                      </span>
                      {isAdmin && (
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--secondary)' }}
                        >
                          STAFF
                        </span>
                      )}
                      <span>•</span>
                      <time title={new Date(m.created_at).toLocaleString('id-ID')}>
                        {timeAgo(m.created_at)}
                      </time>
                    </div>
                    <div
                      className="rounded-xl p-4 text-sm whitespace-pre-wrap break-words"
                      style={{
                        background: bubbleBg,
                        border: `1px solid ${borderColor}`,
                        lineHeight: 1.6,
                      }}
                    >
                      {m.message}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reply form */}
      <div className="card">
        {isClosed ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-2">🔒</div>
            <h4 className="font-semibold mb-1">Tiket sudah ditutup</h4>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              Tiket ini sudah closed. Buat tiket baru kalau kamu butuh bantuan lagi.
            </p>
            <Link href="/dashboard/tickets/new" className="btn btn-primary">
              + Buat Tiket Baru
            </Link>
          </div>
        ) : (
          <>
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              ↩️ Balas Tiket
            </h3>
            <form action={addReplyForm}>
              <input type="hidden" name="ticketId" value={t.id} />
              <div className="mb-4">
                <textarea
                  name="message"
                  required
                  minLength={2}
                  rows={5}
                  placeholder="Tulis balasan kamu di sini..."
                  className="input"
                  style={{ resize: 'vertical', minHeight: 120, fontFamily: 'inherit' }}
                />
              </div>
              <div
                className="flex flex-wrap items-center justify-between gap-3 pt-2"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  💡 Reply ini akan dikirim ke tim support dan kamu akan dapat email saat dibalas.
                </p>
                <button type="submit" className="btn btn-primary">
                  📤 Kirim Balasan
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </>
  );
}
