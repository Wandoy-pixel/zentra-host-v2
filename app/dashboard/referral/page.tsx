import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { fmtRp, timeAgo } from '@/lib/data';
import CopyReferralLink from './CopyReferralLink';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Program Affiliate',
  description: 'Ajak teman pakai Zentra Host dan dapatkan komisi 30% dari setiap transaksi pertama mereka.',
};

const BASE_URL = 'https://zentra-host-v2.vercel.app';
const DEFAULT_COMMISSION_RATE = 30;

type Affiliate = {
  id: number;
  user_id: string;
  referral_code: string;
  commission_rate: number | null;
  created_at: string;
};

type ReferralRow = {
  id: number;
  affiliate_id: number;
  referred_user_email: string | null;
  referred_user_id: string | null;
  status: 'pending' | 'paid' | 'cancelled' | string;
  commission_amount: number | null;
  package_name: string | null;
  created_at: string;
  paid_at: string | null;
};

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: '⏳ Pending', color: '#fbbf24', bg: 'rgba(245,158,11,0.15)' },
  paid: { label: '✅ Paid', color: '#34d399', bg: 'rgba(16,185,129,0.15)' },
  cancelled: { label: '✕ Cancelled', color: '#f87171', bg: 'rgba(239,68,68,0.15)' },
};

function generateReferralCode(email: string): string {
  const username = (email.split('@')[0] || 'USER').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const base = (username.slice(0, 6) || 'USER').padEnd(6, 'X');
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let random = '';
  for (let i = 0; i < 4; i++) {
    random += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${base}-${random}`;
}

export default async function ReferralDashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 1. Cari affiliate user
  let { data: affiliate } = await supabase
    .from('affiliates')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle<Affiliate>();

  // 2. Auto-create kalau belum ada
  if (!affiliate) {
    const code = generateReferralCode(user.email || 'USER');
    const { data: created } = await supabase
      .from('affiliates')
      .insert({
        user_id: user.id,
        referral_code: code,
        commission_rate: DEFAULT_COMMISSION_RATE,
      })
      .select('*')
      .single<Affiliate>();
    affiliate = created || null;
  }

  // Fallback in-memory (kalau insert gagal — misal table belum ada)
  const referralCode =
    affiliate?.referral_code || generateReferralCode(user.email || 'USER');
  const commissionRate = affiliate?.commission_rate ?? DEFAULT_COMMISSION_RATE;
  const referralLink = `${BASE_URL}/register?ref=${referralCode}`;

  // 3. Fetch referrals
  let referrals: ReferralRow[] = [];
  if (affiliate?.id) {
    const { data } = await supabase
      .from('referrals')
      .select('*')
      .eq('affiliate_id', affiliate.id)
      .order('created_at', { ascending: false })
      .limit(20);
    referrals = (data || []) as ReferralRow[];
  }

  // 4. Stats
  const totalReferrals = referrals.length;
  const pendingCommission = referrals
    .filter((r) => r.status === 'pending')
    .reduce((sum, r) => sum + (r.commission_amount || 0), 0);
  const paidCommission = referrals
    .filter((r) => r.status === 'paid')
    .reduce((sum, r) => sum + (r.commission_amount || 0), 0);

  const stats = [
    {
      icon: '👥',
      label: 'Total Referrals',
      value: String(totalReferrals),
      gradient: 'linear-gradient(135deg, rgba(20,184,166,0.18), rgba(20,184,166,0.04))',
      border: 'rgba(20,184,166,0.35)',
      color: 'var(--accent)',
    },
    {
      icon: '⏳',
      label: 'Pending Commission',
      value: fmtRp(pendingCommission),
      gradient: 'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(245,158,11,0.04))',
      border: 'rgba(245,158,11,0.35)',
      color: '#fbbf24',
    },
    {
      icon: '💰',
      label: 'Paid Commission',
      value: fmtRp(paidCommission),
      gradient: 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(16,185,129,0.04))',
      border: 'rgba(16,185,129,0.35)',
      color: '#34d399',
    },
    {
      icon: '📈',
      label: 'Commission Rate',
      value: `${commissionRate}%`,
      gradient: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(99,102,241,0.04))',
      border: 'rgba(99,102,241,0.35)',
      color: '#818cf8',
    },
  ];

  const steps = [
    { n: 1, t: 'Share link kamu ke teman', d: 'Bagikan link referral lewat WhatsApp, Telegram, Twitter, atau media apapun.' },
    { n: 2, t: 'Teman daftar pakai link', d: 'Setiap teman yang klik link & daftar akan otomatis ter-track sebagai referral-mu.' },
    { n: 3, t: 'Teman beli paket pertama', d: 'Saat mereka checkout & bayar paket pertama, komisi langsung dihitung.' },
    { n: 4, t: `Kamu dapat ${commissionRate}% komisi otomatis`, d: 'Komisi masuk dompet referral kamu — bisa dicairkan kalau sudah lunas.' },
  ];

  return (
    <>
      {/* HEADER HERO */}
      <div
        className="card mb-6 overflow-hidden relative"
        style={{
          background: 'linear-gradient(135deg, rgba(20,184,166,0.18), rgba(99,102,241,0.18))',
          border: '1px solid rgba(20,184,166,0.3)',
        }}
      >
        <div
          aria-hidden
          className="absolute -right-12 -top-12 w-56 h-56 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(20,184,166,0.25), transparent 70%)',
            filter: 'blur(10px)',
          }}
        />
        <div className="relative">
          <div
            className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full mb-3"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--accent)' }}
          >
            🎁 PROGRAM AFFILIATE
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">
            Program Affiliate Zentra Host
          </h1>
          <p className="text-sm md:text-base max-w-2xl" style={{ color: 'var(--text-muted)' }}>
            Ajak teman, keluarga, atau audience kamu untuk pakai hosting Zentra. Setiap mereka beli paket pertama,
            kamu otomatis dapat <strong style={{ color: 'var(--accent)' }}>{commissionRate}% komisi</strong>.
            Gak ada minimum referral, gak ada syarat ribet — cukup share link.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
              ✓ Komisi seumur hidup pelanggan
            </span>
            <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
              ✓ Tanpa biaya pendaftaran
            </span>
            <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
              ✓ Dashboard real-time
            </span>
          </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="card transition-all hover:-translate-y-1"
            style={{
              background: s.gradient,
              border: `1px solid ${s.border}`,
            }}
          >
            <div
              className="w-11 h-11 rounded-xl grid place-items-center text-lg mb-3"
              style={{ background: 'rgba(255,255,255,0.06)', color: s.color }}
            >
              {s.icon}
            </div>
            <h2 className="font-extrabold text-2xl mb-0.5" style={{ color: s.color }}>
              {s.value}
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* TWO COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* CARD: REFERRAL LINK */}
        <div
          className="card"
          style={{
            background: 'linear-gradient(180deg, rgba(20,184,166,0.06), transparent)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🔗</span>
            <h3 className="font-bold text-lg">Link Referral Kamu</h3>
          </div>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
            Setiap orang yang daftar via link ini akan terhubung ke akun kamu.
          </p>
          <CopyReferralLink link={referralLink} code={referralCode} />
        </div>

        {/* CARD: CARA KERJA */}
        <div
          className="card"
          style={{
            background: 'linear-gradient(180deg, rgba(99,102,241,0.06), transparent)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">⚙️</span>
            <h3 className="font-bold text-lg">Cara Kerja</h3>
          </div>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
            4 langkah simpel untuk mulai dapat komisi.
          </p>
          <ol className="space-y-3">
            {steps.map((step) => (
              <li key={step.n} className="flex gap-3">
                <div
                  className="w-8 h-8 rounded-full grid place-items-center text-sm font-extrabold flex-shrink-0"
                  style={{
                    background: 'var(--gradient)',
                    color: '#fff',
                  }}
                >
                  {step.n}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm leading-tight mb-0.5">{step.t}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {step.d}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* RECENT REFERRALS TABLE */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-lg">📋 Recent Referrals</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              20 referral terbaru dari link kamu.
            </p>
          </div>
          {referrals.length > 0 && (
            <span
              className="text-xs px-3 py-1.5 rounded-full font-semibold"
              style={{ background: 'rgba(20,184,166,0.12)', color: 'var(--accent)' }}
            >
              {referrals.length} referral
            </span>
          )}
        </div>

        {referrals.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            <div className="text-5xl mb-3">🎯</div>
            <h4 className="font-semibold text-base mb-1" style={{ color: 'var(--text)' }}>
              Belum ada referral
            </h4>
            <p className="text-sm max-w-md mx-auto">
              Mulai share link referral kamu di atas. Setiap teman yang daftar akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm" style={{ borderCollapse: 'separate', borderSpacing: '0 6px' }}>
              <thead>
                <tr className="text-left text-xs" style={{ color: 'var(--text-muted)' }}>
                  <th className="px-3 py-2 font-semibold">User</th>
                  <th className="px-3 py-2 font-semibold">Paket</th>
                  <th className="px-3 py-2 font-semibold">Komisi</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                  <th className="px-3 py-2 font-semibold text-right">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((r) => {
                  const st = STATUS_META[r.status] || STATUS_META.pending;
                  const displayEmail = r.referred_user_email || '— anonim —';
                  const maskedEmail =
                    displayEmail.includes('@') && displayEmail.length > 6
                      ? displayEmail.slice(0, 3) +
                        '***' +
                        displayEmail.slice(displayEmail.indexOf('@'))
                      : displayEmail;

                  return (
                    <tr
                      key={r.id}
                      style={{
                        background: 'var(--bg-card)',
                        borderRadius: 10,
                      }}
                    >
                      <td className="px-3 py-3 rounded-l-lg" style={{ borderLeft: `3px solid ${st.color}` }}>
                        <p className="font-mono text-xs">{maskedEmail}</p>
                      </td>
                      <td className="px-3 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                        {r.package_name || '—'}
                      </td>
                      <td className="px-3 py-3 font-bold text-sm">
                        {r.commission_amount ? fmtRp(r.commission_amount) : '—'}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className="inline-block px-2.5 py-1 rounded-full text-xs font-bold tracking-wide"
                          style={{ background: st.bg, color: st.color }}
                        >
                          {st.label}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right text-xs rounded-r-lg" style={{ color: 'var(--text-muted)' }}>
                        {timeAgo(r.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FOOTER NOTE */}
      <div
        className="card mt-6 text-center"
        style={{
          background: 'rgba(20,184,166,0.05)',
          border: '1px dashed var(--border)',
        }}
      >
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          💡 <strong style={{ color: 'var(--text)' }}>Tips:</strong> Komisi dibayarkan setelah pelanggan menyelesaikan
          pembayaran & masa garansi 14 hari berakhir. Pencairan minimum {fmtRp(50000)} via transfer bank.
        </p>
      </div>
    </>
  );
}
