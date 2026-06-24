import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { fmtRp } from '@/lib/data';
import type { Order } from '@/lib/types';
import type { ProvisioningRecord } from '@/lib/provisioning';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tracking Order',
  description: 'Lacak progress pemesanan dan provisioning layanan hosting kamu secara real-time.',
};

type StepState = 'done' | 'current' | 'pending';

type Step = {
  key: string;
  icon: string;
  iconDone: string;
  iconCurrent: string;
  title: string;
  description: string;
  timestamp: string | null;
  state: StepState;
};

function fmtDateTime(d: string | Date | null | undefined): string {
  if (!d) return '-';
  return new Date(d).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StepNode({ step, isLast }: { step: Step; isLast: boolean }) {
  const isDone = step.state === 'done';
  const isCurrent = step.state === 'current';
  const isPending = step.state === 'pending';

  const icon = isDone ? step.iconDone : isCurrent ? step.iconCurrent : step.icon;

  const circleBg = isDone
    ? 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)'
    : isCurrent
    ? 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)'
    : 'rgba(139,147,167,0.12)';

  const circleBorder = isDone
    ? '2px solid rgba(16,185,129,0.5)'
    : isCurrent
    ? '2px solid rgba(245,158,11,0.5)'
    : '2px solid var(--border)';

  const circleShadow = isDone
    ? '0 0 0 6px rgba(16,185,129,0.12)'
    : isCurrent
    ? '0 0 0 6px rgba(245,158,11,0.15), 0 0 24px rgba(245,158,11,0.35)'
    : 'none';

  const titleColor = isPending ? 'var(--text-muted)' : 'var(--text)';

  const connectorBg = isDone
    ? 'linear-gradient(180deg, #10b981 0%, #14b8a6 100%)'
    : isCurrent
    ? 'linear-gradient(180deg, #f59e0b 0%, var(--border) 100%)'
    : 'var(--border)';

  return (
    <div className="track-step flex gap-4 relative" style={{ paddingBottom: isLast ? 0 : 28 }}>
      {/* Connector vertical line */}
      {!isLast && (
        <div
          aria-hidden
          className="absolute"
          style={{
            left: 27,
            top: 56,
            bottom: 0,
            width: 3,
            background: connectorBg,
            borderRadius: 2,
            transition: 'background 400ms ease',
          }}
        />
      )}

      {/* Icon circle */}
      <div
        className="track-circle relative flex-shrink-0 rounded-full grid place-items-center text-2xl"
        style={{
          width: 56,
          height: 56,
          background: circleBg,
          border: circleBorder,
          boxShadow: circleShadow,
          transition: 'transform 250ms ease, box-shadow 250ms ease',
          color: '#fff',
        }}
      >
        <span style={{ filter: isPending ? 'grayscale(1) opacity(0.6)' : 'none' }}>{icon}</span>
        {isCurrent && (
          <span
            aria-hidden
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              border: '2px solid rgba(245,158,11,0.6)',
              animation: 'trackPulse 1.6s ease-out infinite',
            }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-1">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h4
            className="font-bold text-base"
            style={{ color: titleColor, letterSpacing: '-0.2px' }}
          >
            {step.title}
          </h4>
          {isDone && (
            <span
              className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide"
              style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}
            >
              SELESAI
            </span>
          )}
          {isCurrent && (
            <span
              className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide"
              style={{ background: 'rgba(245,158,11,0.18)', color: '#f59e0b' }}
            >
              SEDANG BERJALAN
            </span>
          )}
          {isPending && (
            <span
              className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide"
              style={{ background: 'rgba(139,147,167,0.15)', color: 'var(--text-muted)' }}
            >
              MENUNGGU
            </span>
          )}
        </div>
        <p
          className="text-sm mb-1.5"
          style={{ color: isPending ? 'var(--text-muted)' : 'var(--text-muted)', lineHeight: 1.55 }}
        >
          {step.description}
        </p>
        {step.timestamp && (
          <div
            className="text-xs font-mono"
            style={{ color: isPending ? 'var(--text-muted)' : 'var(--accent)' }}
          >
            🕒 {fmtDateTime(step.timestamp)}
          </div>
        )}
      </div>
    </div>
  );
}

export default async function OrderTrackingPage({
  params,
}: {
  params: { orderId: string };
}) {
  const orderId = Number(params.orderId);
  if (!orderId || isNaN(orderId)) notFound();

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch order dengan ownership check
  const { data: orderData } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single();

  if (!orderData) notFound();

  const order = orderData as Order;

  // Fetch provisioning record kalau ada
  const { data: provData } = await supabase
    .from('provisioning_queue')
    .select('*')
    .eq('order_id', orderId)
    .eq('user_id', user.id)
    .maybeSingle();

  const prov = (provData as ProvisioningRecord | null) ?? null;

  // Compute steps state
  const paymentConfirmed = !!order.payment;
  const provisioningStarted = !!prov;
  const provisioningActive = prov?.status === 'active';
  const provisioningFailed = prov?.status === 'failed';

  // Step 1: Order Received — selalu done karena order sudah ada
  // Step 2: Payment Confirmed — done kalau payment != null
  // Step 3: Provisioning — current saat menunggu/pending, done saat active
  // Step 4: Ready to Use — done kalau provisioning active

  const step1State: StepState = 'done';
  const step2State: StepState = paymentConfirmed ? 'done' : 'current';
  const step3State: StepState = !paymentConfirmed
    ? 'pending'
    : provisioningActive
    ? 'done'
    : 'current';
  const step4State: StepState = provisioningActive ? 'done' : 'pending';

  const steps: Step[] = [
    {
      key: 'received',
      icon: '📥',
      iconDone: '✅',
      iconCurrent: '⏳',
      title: 'Order Diterima',
      description: `Pesanan ${order.name} (${order.type.toUpperCase()}) berhasil dibuat di sistem kami.`,
      timestamp: order.created_at,
      state: step1State,
    },
    {
      key: 'payment',
      icon: '💳',
      iconDone: '✅',
      iconCurrent: '⏳',
      title: 'Pembayaran Dikonfirmasi',
      description: paymentConfirmed
        ? `Pembayaran via ${order.payment?.toUpperCase()} sudah berhasil dikonfirmasi.`
        : 'Menunggu konfirmasi pembayaran dari payment gateway.',
      timestamp: paymentConfirmed ? order.created_at : null,
      state: step2State,
    },
    {
      key: 'provisioning',
      icon: '⚙️',
      iconDone: '✅',
      iconCurrent: '⏳',
      title: provisioningActive ? 'Layanan Telah Diaktifkan' : 'Provisioning Sedang Berjalan',
      description: provisioningFailed
        ? 'Provisioning gagal. Tim kami sudah diberi tahu — silakan hubungi support.'
        : provisioningActive
        ? 'Akun hosting kamu sudah berhasil dibuat dan siap dipakai.'
        : provisioningStarted
        ? 'Sistem sedang menyiapkan resource server, FTP, dan database untuk kamu.'
        : paymentConfirmed
        ? 'Sebentar lagi sistem akan mulai menyiapkan akun hosting kamu.'
        : 'Akan dimulai setelah pembayaran dikonfirmasi.',
      timestamp: prov?.activated_at ?? null,
      state: step3State,
    },
    {
      key: 'ready',
      icon: '🎯',
      iconDone: '🎉',
      iconCurrent: '🎯',
      title: 'Siap Digunakan',
      description: provisioningActive
        ? 'Semua siap! Kamu bisa langsung akses cPanel, upload file, dan deploy website.'
        : 'Setelah provisioning selesai, kamu akan bisa langsung pakai layanan ini.',
      timestamp: provisioningActive ? prov?.activated_at ?? null : null,
      state: step4State,
    },
  ];

  const orderNo = 'INV-' + String(order.id).padStart(6, '0');
  const completedCount = steps.filter((s) => s.state === 'done').length;
  const progressPct = Math.round((completedCount / steps.length) * 100);

  return (
    <>
      {/* Inline keyframes & hover styles (server-rendered, scoped via class names) */}
      <style>{`
        @keyframes trackPulse {
          0%   { transform: scale(1); opacity: 0.8; }
          70%  { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes trackFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes progressShine {
          from { background-position: 0% 50%; }
          to   { background-position: 200% 50%; }
        }
        .track-step {
          animation: trackFadeUp 420ms ease both;
        }
        .track-step:nth-child(1) { animation-delay: 0ms; }
        .track-step:nth-child(2) { animation-delay: 80ms; }
        .track-step:nth-child(3) { animation-delay: 160ms; }
        .track-step:nth-child(4) { animation-delay: 240ms; }
        .track-step:hover .track-circle {
          transform: scale(1.08);
          box-shadow: 0 0 0 8px rgba(20,184,166,0.12);
        }
        .track-cred-row {
          transition: background 180ms ease, transform 180ms ease;
        }
        .track-cred-row:hover {
          background: rgba(20,184,166,0.06);
        }
        .track-action-btn {
          transition: transform 180ms ease, box-shadow 180ms ease;
        }
        .track-action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(20,184,166,0.25);
        }
        .track-progress-bar {
          background: linear-gradient(90deg, #14b8a6 0%, #6366f1 50%, #14b8a6 100%);
          background-size: 200% 100%;
          animation: progressShine 3s linear infinite;
        }
      `}</style>

      {/* Header */}
      <div className="card mb-6">
        <div className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
          <Link href="/dashboard/invoice" className="hover:underline">
            ← Riwayat Invoice
          </Link>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="font-mono font-semibold">{orderNo}</span>
              <span>•</span>
              <span>{order.type.toUpperCase()}</span>
              <span>•</span>
              <span>{order.period} bulan</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold mb-1" style={{ letterSpacing: '-0.5px' }}>
              Tracking Order #{orderNo}
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Pantau progress pemesanan {order.name} kamu secara real-time.
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
              Total Pembayaran
            </div>
            <div
              className="text-2xl font-extrabold"
              style={{
                background: 'var(--gradient-text)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {fmtRp(order.price)}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs mb-2">
            <span style={{ color: 'var(--text-muted)' }}>
              Progress: {completedCount} / {steps.length} langkah
            </span>
            <span className="font-bold" style={{ color: 'var(--accent)' }}>
              {progressPct}%
            </span>
          </div>
          <div
            className="rounded-full overflow-hidden"
            style={{ height: 8, background: 'rgba(139,147,167,0.15)' }}
          >
            <div
              className="track-progress-bar h-full rounded-full"
              style={{
                width: `${progressPct}%`,
                transition: 'width 600ms cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="card mb-6">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          📍 Progress Timeline
        </h3>
        <div className="relative">
          {steps.map((step, idx) => (
            <StepNode key={step.key} step={step} isLast={idx === steps.length - 1} />
          ))}
        </div>
      </div>

      {/* Service detail card */}
      <div className="card mb-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          📦 Detail Layanan
        </h3>

        {prov ? (
          <div className="space-y-1">
            <div
              className="track-cred-row flex flex-wrap items-center justify-between gap-3 py-3 px-3 rounded-lg"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Service
              </div>
              <div className="font-semibold text-sm">
                {prov.service_name}{' '}
                <span style={{ color: 'var(--text-muted)' }}>
                  ({prov.service_type.toUpperCase()})
                </span>
              </div>
            </div>

            <div
              className="track-cred-row flex flex-wrap items-center justify-between gap-3 py-3 px-3 rounded-lg"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Subdomain
              </div>
              <div className="font-mono text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                {prov.subdomain}
              </div>
            </div>

            <div
              className="track-cred-row flex flex-wrap items-center justify-between gap-3 py-3 px-3 rounded-lg"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                FTP Host
              </div>
              <div className="font-mono text-sm">
                {prov.ftp_host}:{prov.ftp_port}
              </div>
            </div>

            <div
              className="track-cred-row flex flex-wrap items-center justify-between gap-3 py-3 px-3 rounded-lg"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                FTP Username
              </div>
              <div className="font-mono text-sm">{prov.ftp_username}</div>
            </div>

            <div
              className="track-cred-row flex flex-wrap items-center justify-between gap-3 py-3 px-3 rounded-lg"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                MySQL Host
              </div>
              <div className="font-mono text-sm">{prov.mysql_host}</div>
            </div>

            <div
              className="track-cred-row flex flex-wrap items-center justify-between gap-3 py-3 px-3 rounded-lg"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                MySQL Database
              </div>
              <div className="font-mono text-sm">{prov.mysql_database}</div>
            </div>

            <div className="track-cred-row flex flex-wrap items-center justify-between gap-3 py-3 px-3 rounded-lg">
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                MySQL Username
              </div>
              <div className="font-mono text-sm">{prov.mysql_username}</div>
            </div>

            <div
              className="mt-4 p-4 rounded-lg text-sm flex items-start gap-2"
              style={{
                background: 'rgba(20,184,166,0.08)',
                border: '1px solid rgba(20,184,166,0.25)',
                color: 'var(--text-muted)',
              }}
            >
              <span className="text-base">🔐</span>
              <div>
                Password FTP &amp; MySQL disembunyikan di halaman ini demi keamanan. Buka{' '}
                <Link
                  href={`/dashboard/hosting/${prov.id}`}
                  className="font-semibold underline"
                  style={{ color: 'var(--accent)' }}
                >
                  Detail Hosting
                </Link>{' '}
                untuk melihat &amp; menyalin credentials lengkap.
              </div>
            </div>
          </div>
        ) : (
          <div
            className="text-center py-8 rounded-lg"
            style={{ background: 'rgba(139,147,167,0.06)', border: '1px dashed var(--border)' }}
          >
            <div className="text-4xl mb-2">⏳</div>
            <h4 className="font-semibold mb-1">Credentials sedang disiapkan</h4>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Detail subdomain, FTP, dan MySQL akan muncul di sini setelah provisioning selesai.
            </p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="card">
        <h3 className="text-base font-bold mb-4 flex items-center gap-2">
          ⚡ Aksi Cepat
        </h3>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/cpanel"
            className="track-action-btn btn btn-primary"
            style={{ opacity: provisioningActive ? 1 : 0.55, pointerEvents: provisioningActive ? 'auto' : 'none' }}
            aria-disabled={!provisioningActive}
          >
            🎛️ Akses cPanel
          </Link>
          {prov && (
            <Link href={`/dashboard/hosting/${prov.id}`} className="track-action-btn btn">
              📂 Lihat Detail Hosting
            </Link>
          )}
          <Link href="/dashboard/tickets/new" className="track-action-btn btn">
            💬 Hubungi Support
          </Link>
          <Link href="/dashboard/invoice" className="track-action-btn btn">
            📄 Lihat Invoice
          </Link>
        </div>
        {!provisioningActive && (
          <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
            💡 Tombol "Akses cPanel" akan aktif begitu provisioning selesai.
          </p>
        )}
      </div>
    </>
  );
}
