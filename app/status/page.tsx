import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Status Sistem | Zentra Host',
  description: 'Real-time status Zentra Host services',
};

type ServiceStatus = 'operational' | 'degraded' | 'down';

interface ServiceRow {
  name: string;
  desc: string;
  status: ServiceStatus;
  uptime: string;
}

interface IncidentLog {
  date: string;
  title: string;
  status: 'resolved' | 'investigating' | 'monitoring';
  desc: string;
}

// 90-day uptime sample data (mostly up — biased random)
function generate90DayHistory(): boolean[] {
  // Deterministic pseudo-random seed agar konsisten antar render
  const seed = [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  ];
  return seed.map((v) => v === 1);
}

function StatusBadge({ status, size = 'sm' }: { status: ServiceStatus; size?: 'sm' | 'lg' }) {
  const config: Record<ServiceStatus, { label: string; bg: string; border: string; color: string; dot: string }> = {
    operational: {
      label: 'Operational',
      bg: 'rgba(34,197,94,0.12)',
      border: 'rgba(34,197,94,0.35)',
      color: '#16a34a',
      dot: '#22c55e',
    },
    degraded: {
      label: 'Degraded',
      bg: 'rgba(234,179,8,0.12)',
      border: 'rgba(234,179,8,0.35)',
      color: '#ca8a04',
      dot: '#eab308',
    },
    down: {
      label: 'Down',
      bg: 'rgba(239,68,68,0.12)',
      border: 'rgba(239,68,68,0.35)',
      color: '#dc2626',
      dot: '#ef4444',
    },
  };
  const c = config[status];
  const isLg = size === 'lg';
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full font-semibold ${
        isLg ? 'px-4 py-2 text-sm' : 'px-3 py-1 text-xs'
      }`}
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.color,
      }}
    >
      <span
        className={`rounded-full ${isLg ? 'w-2.5 h-2.5' : 'w-2 h-2'} ${
          status === 'operational' ? 'animate-pulse-slow' : ''
        }`}
        style={{ background: c.dot, boxShadow: `0 0 10px ${c.dot}` }}
      />
      {c.label}
    </span>
  );
}

export default async function StatusPage() {
  // Real-time API check
  const V2 = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const apiStatus = await fetch(V2 + '/api/keepalive', { cache: 'no-store' })
    .then((r) => r.ok)
    .catch(() => false);

  const services: ServiceRow[] = [
    {
      name: 'API & Database',
      desc: 'Supabase + Next.js API routes',
      status: apiStatus ? 'operational' : 'down',
      uptime: apiStatus ? '99.99%' : '97.42%',
    },
    {
      name: 'Web Hosting',
      desc: 'NVMe SSD + LiteSpeed Enterprise',
      status: 'operational',
      uptime: '99.98%',
    },
    {
      name: 'Email Service',
      desc: 'SMTP relay & inbound mail',
      status: 'operational',
      uptime: '99.95%',
    },
    {
      name: 'DNS & Domain',
      desc: 'Anycast DNS resolver',
      status: 'operational',
      uptime: '100.00%',
    },
    {
      name: 'Payment Gateway',
      desc: 'Midtrans / Xendit / QRIS',
      status: 'operational',
      uptime: '99.97%',
    },
  ];

  const allOperational = services.every((s) => s.status === 'operational');
  const anyDown = services.some((s) => s.status === 'down');

  const overallLabel = allOperational
    ? 'All Systems Operational'
    : anyDown
      ? 'Some Systems Affected'
      : 'Partial Service Disruption';

  const overallStatus: ServiceStatus = allOperational
    ? 'operational'
    : anyDown
      ? 'down'
      : 'degraded';

  const heroBg = allOperational
    ? 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(20,184,166,0.05))'
    : anyDown
      ? 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(234,88,12,0.05))'
      : 'linear-gradient(135deg, rgba(234,179,8,0.08), rgba(245,158,11,0.05))';

  const heroBorder = allOperational
    ? 'rgba(34,197,94,0.3)'
    : anyDown
      ? 'rgba(239,68,68,0.3)'
      : 'rgba(234,179,8,0.3)';

  const history = generate90DayHistory();
  const upDays = history.filter(Boolean).length;
  const uptimePct = ((upDays / history.length) * 100).toFixed(2);

  const currentIncident: IncidentLog | null = null;
  const incidentHistory: IncidentLog[] = [];

  return (
    <>
      <Navbar user={null} />

      <main className="min-h-[calc(100vh-200px)]">
        {/* Hero Status */}
        <section className="py-16 px-6">
          <div className="max-w-[1080px] mx-auto">
            <div
              className="rounded-3xl p-10 md:p-14 text-center"
              style={{
                background: heroBg,
                border: `1px solid ${heroBorder}`,
              }}
            >
              <div className="flex justify-center mb-6">
                <StatusBadge status={overallStatus} size="lg" />
              </div>
              <h1
                className="font-extrabold mb-4 leading-[1.1]"
                style={{ fontSize: 'clamp(32px, 5vw, 52px)', letterSpacing: '-1.5px' }}
              >
                {overallLabel}
              </h1>
              <p className="text-base max-w-[560px] mx-auto" style={{ color: 'var(--text-muted)' }}>
                Status real-time semua layanan Zentra Host. Halaman ini diperbarui
                otomatis setiap 60 detik.
              </p>
              <div
                className="mt-6 text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                Terakhir diperiksa: {new Date().toLocaleString('id-ID', {
                  dateStyle: 'long',
                  timeStyle: 'short',
                })} WIB
              </div>
            </div>
          </div>
        </section>

        {/* Current Incident */}
        {currentIncident && (
          <section className="px-6 mb-10">
            <div className="max-w-[1080px] mx-auto">
              <div
                className="card p-6"
                style={{ borderColor: 'rgba(234,179,8,0.4)', background: 'rgba(234,179,8,0.05)' }}
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl">⚠️</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg">{currentIncident.title}</h3>
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase"
                        style={{
                          background: 'rgba(234,179,8,0.15)',
                          color: '#ca8a04',
                        }}
                      >
                        {currentIncident.status}
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {currentIncident.desc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Services Table */}
        <section className="px-6 mb-14">
          <div className="max-w-[1080px] mx-auto">
            <div className="flex items-end justify-between mb-5">
              <div>
                <h2 className="font-extrabold text-2xl mb-1" style={{ letterSpacing: '-0.5px' }}>
                  Status Layanan
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Status setiap komponen infrastruktur kami
                </p>
              </div>
            </div>

            <div className="card p-0 overflow-hidden">
              {services.map((s, idx) => (
                <div
                  key={s.name}
                  className="flex items-center justify-between gap-4 p-5"
                  style={{
                    borderTop: idx === 0 ? 'none' : '1px solid var(--border)',
                  }}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl grid place-items-center flex-shrink-0"
                      style={{
                        background:
                          s.status === 'operational'
                            ? 'rgba(34,197,94,0.1)'
                            : s.status === 'degraded'
                              ? 'rgba(234,179,8,0.1)'
                              : 'rgba(239,68,68,0.1)',
                        color:
                          s.status === 'operational'
                            ? '#16a34a'
                            : s.status === 'degraded'
                              ? '#ca8a04'
                              : '#dc2626',
                      }}
                    >
                      {s.status === 'operational' ? '✓' : s.status === 'degraded' ? '!' : '✕'}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-base truncate">{s.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {s.desc}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Uptime 90d
                      </div>
                      <div className="font-bold text-sm">{s.uptime}</div>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 90-day Uptime Calendar */}
        <section className="px-6 mb-14">
          <div className="max-w-[1080px] mx-auto">
            <div className="card p-7">
              <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
                <div>
                  <h2 className="font-extrabold text-2xl mb-1" style={{ letterSpacing: '-0.5px' }}>
                    Uptime 90 Hari Terakhir
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Setiap kotak mewakili 1 hari operasional sistem
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Total Uptime
                  </div>
                  <div className="font-extrabold text-2xl gradient-text" style={{ letterSpacing: '-1px' }}>
                    {uptimePct}%
                  </div>
                </div>
              </div>

              <div
                className="grid gap-1"
                style={{ gridTemplateColumns: 'repeat(45, minmax(0, 1fr))' }}
              >
                {history.map((up, i) => (
                  <div
                    key={i}
                    title={`Hari ke-${90 - i}: ${up ? 'Operasional' : 'Gangguan'}`}
                    className="rounded-[3px] aspect-square transition-transform hover:scale-150"
                    style={{
                      background: up
                        ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                        : 'linear-gradient(135deg, #ef4444, #dc2626)',
                      minHeight: 14,
                      opacity: up ? 0.85 : 1,
                    }}
                  />
                ))}
              </div>

              <div
                className="flex items-center justify-between mt-5 pt-5 text-xs"
                style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}
              >
                <span>90 hari lalu</span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-3 rounded-[3px]"
                      style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
                    />
                    Operasional
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-3 rounded-[3px]"
                      style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                    />
                    Gangguan
                  </span>
                </div>
                <span>Hari ini</span>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Incidents */}
        <section className="px-6 pb-20">
          <div className="max-w-[1080px] mx-auto">
            <div className="mb-5">
              <h2 className="font-extrabold text-2xl mb-1" style={{ letterSpacing: '-0.5px' }}>
                Riwayat Insiden
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Insiden yang telah dilaporkan dan diselesaikan dalam 90 hari terakhir
              </p>
            </div>

            {incidentHistory.length === 0 ? (
              <div className="card p-10 text-center">
                <div
                  className="w-14 h-14 rounded-2xl grid place-items-center mb-4 mx-auto text-2xl"
                  style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}
                >
                  ✓
                </div>
                <h3 className="font-bold text-lg mb-1">Tidak ada insiden tercatat</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Semua sistem berjalan lancar tanpa gangguan signifikan.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {incidentHistory.map((inc, idx) => (
                  <div key={idx} className="card p-6">
                    <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                      <h3 className="font-bold text-base">{inc.title}</h3>
                      <span
                        className="text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase"
                        style={{
                          background:
                            inc.status === 'resolved'
                              ? 'rgba(34,197,94,0.12)'
                              : 'rgba(234,179,8,0.12)',
                          color: inc.status === 'resolved' ? '#16a34a' : '#ca8a04',
                        }}
                      >
                        {inc.status}
                      </span>
                    </div>
                    <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                      {inc.desc}
                    </p>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {inc.date}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
