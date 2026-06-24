import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { fmtRp, timeAgo } from '@/lib/data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Loyalty Points',
  description: 'Kumpulkan poin loyalitas dan tukar dengan diskon, voucher, dan reward menarik dari Zentra Host.',
};

type LoyaltyEntry = {
  id: number;
  user_id: string;
  points: number;
  reason: 'purchase' | 'redeem' | 'bonus';
  order_id: number | null;
  created_at: string;
};

type TierKey = 'bronze' | 'silver' | 'gold' | 'platinum';

type Tier = {
  key: TierKey;
  name: string;
  icon: string;
  min: number;
  max: number | null;
  color: string;
  gradient: string;
  perks: string[];
};

const TIERS: Tier[] = [
  {
    key: 'bronze',
    name: 'Bronze',
    icon: '🥉',
    min: 0,
    max: 999,
    color: '#cd7f32',
    gradient: 'linear-gradient(135deg, #8b4513 0%, #cd7f32 100%)',
    perks: ['Akses program loyalty', 'Tukar poin jadi diskon'],
  },
  {
    key: 'silver',
    name: 'Silver',
    icon: '🥈',
    min: 1000,
    max: 4999,
    color: '#c0c0c0',
    gradient: 'linear-gradient(135deg, #71717a 0%, #d4d4d8 100%)',
    perks: ['Diskon 5% semua paket', 'Tukar poin jadi diskon'],
  },
  {
    key: 'gold',
    name: 'Gold',
    icon: '🥇',
    min: 5000,
    max: 19999,
    color: '#f5b301',
    gradient: 'linear-gradient(135deg, #b8860b 0%, #fbbf24 100%)',
    perks: ['Diskon 10% semua paket', 'Priority support', 'Tukar poin jadi diskon'],
  },
  {
    key: 'platinum',
    name: 'Platinum',
    icon: '💎',
    min: 20000,
    max: null,
    color: '#a78bfa',
    gradient: 'linear-gradient(135deg, #4c1d95 0%, #a78bfa 100%)',
    perks: ['Diskon 15% semua paket', 'VIP support', 'Free domain .com tiap tahun'],
  },
];

const REWARDS: { id: string; title: string; desc: string; cost: number; icon: string }[] = [
  { id: 'voucher-10k', title: 'Voucher Rp 10.000', desc: 'Potongan langsung di order berikutnya.', cost: 1000, icon: '🎟️' },
  { id: 'voucher-50k', title: 'Voucher Rp 50.000', desc: 'Hemat lebih banyak untuk paket favoritmu.', cost: 5000, icon: '💰' },
  { id: 'upgrade-business', title: 'Free Upgrade Business', desc: 'Naikkan paket hosting ke Business 1 bulan.', cost: 10000, icon: '🚀' },
  { id: 'free-domain', title: 'Free Domain .com 1 Tahun', desc: 'Klaim 1 domain .com gratis selama 1 tahun.', cost: 15000, icon: '🌐' },
];

function getCurrentTier(lifetimeEarned: number): Tier {
  let current = TIERS[0];
  for (const t of TIERS) {
    if (lifetimeEarned >= t.min) current = t;
  }
  return current;
}

function getNextTier(current: Tier): Tier | null {
  const idx = TIERS.findIndex((t) => t.key === current.key);
  if (idx === -1 || idx === TIERS.length - 1) return null;
  return TIERS[idx + 1];
}

const REASON_META: Record<LoyaltyEntry['reason'], { label: string; color: string; bg: string; icon: string }> = {
  purchase: { label: 'Pembelian', color: '#34d399', bg: 'rgba(16,185,129,0.15)', icon: '🛒' },
  bonus: { label: 'Bonus', color: '#fbbf24', bg: 'rgba(245,158,11,0.18)', icon: '🎁' },
  redeem: { label: 'Penukaran', color: '#f87171', bg: 'rgba(239,68,68,0.15)', icon: '🎯' },
};

export default async function LoyaltyDashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: entries } = await supabase
    .from('loyalty_points')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  const history = (entries || []) as LoyaltyEntry[];

  // Saldo poin saat ini = sum semua entries (purchase/bonus positif, redeem biasanya negatif)
  const { data: allEntries } = await supabase
    .from('loyalty_points')
    .select('points, reason')
    .eq('user_id', user.id);

  const list = (allEntries || []) as Pick<LoyaltyEntry, 'points' | 'reason'>[];

  const balance = list.reduce((acc, e) => acc + (e.points || 0), 0);
  const lifetimeEarned = list
    .filter((e) => e.reason === 'purchase' || e.reason === 'bonus')
    .reduce((acc, e) => acc + Math.max(0, e.points || 0), 0);
  const totalRedeemed = list
    .filter((e) => e.reason === 'redeem')
    .reduce((acc, e) => acc + Math.abs(e.points || 0), 0);

  const currentTier = getCurrentTier(lifetimeEarned);
  const nextTier = getNextTier(currentTier);
  const progressPct = nextTier
    ? Math.min(100, Math.max(0, ((lifetimeEarned - currentTier.min) / (nextTier.min - currentTier.min)) * 100))
    : 100;
  const pointsToNext = nextTier ? Math.max(0, nextTier.min - lifetimeEarned) : 0;

  // 100 points = Rp 1.000
  const balanceRupiah = Math.floor(balance / 100) * 1000;

  return (
    <>
      {/* HERO CARD */}
      <div
        className="card mb-6 relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, rgba(245,158,11,0.18) 0%, rgba(251,191,36,0.08) 50%, rgba(184,134,11,0.18) 100%)',
          border: '1px solid rgba(251,191,36,0.35)',
        }}
      >
        <div
          className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, #fbbf24 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }}
        />

        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="flex-1 min-w-[260px]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⭐</span>
              <h3 className="text-lg font-bold tracking-tight">Loyalty Points</h3>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              Tukar dengan diskon!
            </p>

            <div className="flex items-end gap-3 mb-1">
              <h1
                className="font-extrabold leading-none"
                style={{
                  fontSize: '4rem',
                  letterSpacing: '-2px',
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #b45309 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {balance.toLocaleString('id-ID')}
              </h1>
              <span className="text-base font-semibold pb-2" style={{ color: 'var(--text-muted)' }}>
                poin
              </span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Setara <strong style={{ color: '#fbbf24' }}>{fmtRp(balanceRupiah)}</strong> diskon
              <span className="mx-2">•</span>
              100 poin = Rp 1.000
            </p>
          </div>

          {/* Tier Badge */}
          <div
            className="flex-shrink-0 rounded-2xl p-5 text-center min-w-[180px]"
            style={{
              background: currentTier.gradient,
              boxShadow: `0 8px 24px ${currentTier.color}55`,
            }}
          >
            <div className="text-4xl mb-1">{currentTier.icon}</div>
            <div className="text-xs font-semibold uppercase tracking-widest text-white/80">Tier kamu</div>
            <div className="text-2xl font-extrabold text-white">{currentTier.name}</div>
          </div>
        </div>

        {/* Progress to next tier */}
        <div className="relative mt-6">
          {nextTier ? (
            <>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold" style={{ color: 'var(--text)' }}>
                  Progress ke {nextTier.icon} {nextTier.name}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>
                  {pointsToNext.toLocaleString('id-ID')} poin lagi
                </span>
              </div>
              <div
                className="h-3 rounded-full overflow-hidden"
                style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(251,191,36,0.25)' }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${progressPct}%`,
                    background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)',
                    boxShadow: '0 0 12px rgba(251,191,36,0.6)',
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
                <span>{currentTier.min.toLocaleString('id-ID')} pts</span>
                <span>{nextTier.min.toLocaleString('id-ID')} pts</span>
              </div>
            </>
          ) : (
            <div
              className="text-center py-3 rounded-xl text-sm font-semibold"
              style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}
            >
              🎉 Tier tertinggi! Kamu adalah member VIP Zentra Host.
            </div>
          )}
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { ic: '⭐', val: balance.toLocaleString('id-ID'), label: 'Saldo Poin', bg: 'rgba(251,191,36,0.12)', cl: '#fbbf24' },
          { ic: '📈', val: lifetimeEarned.toLocaleString('id-ID'), label: 'Total Terkumpul', bg: 'rgba(20,184,166,0.1)', cl: 'var(--accent)' },
          { ic: '🎯', val: totalRedeemed.toLocaleString('id-ID'), label: 'Total Ditukar', bg: 'rgba(99,102,241,0.1)', cl: 'var(--secondary)' },
          { ic: '💎', val: currentTier.name, label: 'Tier Kamu', bg: 'rgba(167,139,250,0.1)', cl: currentTier.color },
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

      {/* TIER BENEFITS */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold mb-1">🏆 Tier & Benefit</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              1 IDR belanja = 1 poin. Semakin tinggi tier, semakin besar untungnya.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {TIERS.map((t) => {
            const isCurrent = t.key === currentTier.key;
            const rangeLabel = t.max ? `${t.min.toLocaleString('id-ID')} – ${t.max.toLocaleString('id-ID')} pts` : `${t.min.toLocaleString('id-ID')}+ pts`;
            return (
              <div
                key={t.key}
                className="rounded-xl p-4 relative transition-all"
                style={{
                  background: isCurrent ? t.gradient : 'var(--bg-card)',
                  border: isCurrent ? '2px solid transparent' : '1px solid var(--border)',
                  color: isCurrent ? 'white' : 'var(--text)',
                  boxShadow: isCurrent ? `0 6px 20px ${t.color}55` : 'none',
                }}
              >
                {isCurrent && (
                  <span
                    className="absolute top-2 right-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.25)', color: 'white' }}
                  >
                    Aktif
                  </span>
                )}
                <div className="text-3xl mb-2">{t.icon}</div>
                <h4 className="font-extrabold text-lg leading-tight">{t.name}</h4>
                <p className="text-[11px] mb-3 opacity-80">{rangeLabel}</p>
                <ul className="text-xs space-y-1.5">
                  {t.perks.map((p) => (
                    <li key={p} className="flex gap-1.5">
                      <span className="opacity-80">✓</span>
                      <span className={isCurrent ? '' : 'text-[var(--text-muted)]'}>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* REWARDS GRID */}
      <div className="card mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-bold mb-1">🎁 Tukar Poin</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Pilih reward favoritmu — poin langsung dipotong dari saldo.
            </p>
          </div>
          <span
            className="text-xs font-bold px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}
          >
            Saldo: {balance.toLocaleString('id-ID')} pts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {REWARDS.map((r) => {
            const canRedeem = balance >= r.cost;
            return (
              <div
                key={r.id}
                className="rounded-xl p-4 transition-all relative overflow-hidden"
                style={{
                  background: 'var(--bg-card)',
                  border: canRedeem ? '1px solid rgba(251,191,36,0.4)' : '1px solid var(--border)',
                  opacity: canRedeem ? 1 : 0.7,
                }}
              >
                {canRedeem && (
                  <div
                    className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-40"
                    style={{ background: '#fbbf24' }}
                  />
                )}
                <div className="relative">
                  <div
                    className="w-12 h-12 rounded-xl grid place-items-center text-2xl mb-3"
                    style={{
                      background: canRedeem
                        ? 'linear-gradient(135deg, rgba(251,191,36,0.25) 0%, rgba(245,158,11,0.15) 100%)'
                        : 'rgba(139,147,167,0.1)',
                      border: canRedeem ? '1px solid rgba(251,191,36,0.3)' : 'none',
                    }}
                  >
                    {r.icon}
                  </div>
                  <h4 className="font-bold text-sm mb-1">{r.title}</h4>
                  <p className="text-[11px] mb-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {r.desc}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-xs font-extrabold"
                      style={{ color: canRedeem ? '#fbbf24' : 'var(--text-muted)' }}
                    >
                      {r.cost.toLocaleString('id-ID')} pts
                    </span>
                    <button
                      type="button"
                      disabled={!canRedeem}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all disabled:cursor-not-allowed"
                      style={
                        canRedeem
                          ? {
                              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                              color: '#1a1a1a',
                              boxShadow: '0 4px 12px rgba(251,191,36,0.35)',
                            }
                          : {
                              background: 'var(--bg)',
                              color: 'var(--text-muted)',
                              border: '1px solid var(--border)',
                            }
                      }
                    >
                      {canRedeem ? 'Tukar' : 'Kurang'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* HISTORY TABLE */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold mb-1">📜 Riwayat Poin</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              20 transaksi poin terakhir di akun kamu.
            </p>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            <div className="text-5xl mb-3">✨</div>
            <h4 className="font-semibold mb-2 text-base" style={{ color: 'var(--text)' }}>
              Belum ada poin
            </h4>
            <p className="text-sm max-w-md mx-auto">
              Lakukan pembelian paket hosting atau domain untuk mulai mengumpulkan poin loyalty.
              Setiap Rp 1 belanja = 1 poin.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm border-separate border-spacing-y-2 px-2">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  <th className="py-2 px-3 font-semibold">Tanggal</th>
                  <th className="py-2 px-3 font-semibold">Aktivitas</th>
                  <th className="py-2 px-3 font-semibold">Order</th>
                  <th className="py-2 px-3 font-semibold text-right">Poin</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => {
                  const meta = REASON_META[h.reason] || REASON_META.bonus;
                  const isPositive = h.points >= 0;
                  return (
                    <tr
                      key={h.id}
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                    >
                      <td className="py-3 px-3 rounded-l-xl">
                        <div className="text-sm font-medium">{timeAgo(h.created_at)}</div>
                        <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          {new Date(h.created_at).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                          style={{ background: meta.bg, color: meta.color }}
                        >
                          <span>{meta.icon}</span>
                          {meta.label}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {h.order_id ? (
                          <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                            INV-{String(h.order_id).padStart(6, '0')}
                          </span>
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            —
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right rounded-r-xl">
                        <span
                          className="font-extrabold text-base"
                          style={{ color: isPositive ? '#34d399' : '#f87171' }}
                        >
                          {isPositive ? '+' : ''}
                          {h.points.toLocaleString('id-ID')}
                        </span>
                        <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          pts
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
