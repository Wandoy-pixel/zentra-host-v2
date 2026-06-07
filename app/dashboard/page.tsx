import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { fmtRp, PAKET_QUOTA, timeAgo } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function DashboardOverview() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [
    { data: orders },
    { data: notifications },
    { data: activities },
    { count: subC },
    { count: emC },
    { count: dbC },
  ] = await Promise.all([
    supabase.from('orders').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
    supabase.from('notifications').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('activity_log').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('subdomains').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
    supabase.from('email_accounts').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
    supabase.from('user_databases').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
  ]);

  const allOrders = orders || [];
  const hosting = allOrders.filter((o) => o.type !== 'domain');
  const domains = allOrders.filter((o) => o.type === 'domain');
  const total = allOrders.reduce((s, o) => s + Number(o.price), 0);

  // Calculate resource usage
  let totalDisk = 0, totalBw = 0;
  hosting.forEach((o) => {
    const q = PAKET_QUOTA[o.name];
    if (q) { totalDisk += q.disk; totalBw += q.bw; }
  });
  if (totalDisk === 0) { totalDisk = 1; totalBw = 1; }
  const subdomainCount = subC || 0;
  const emailCount = emC || 0;
  const dbCount = dbC || 0;
  const usedDisk = Math.min(totalDisk, subdomainCount * 0.1 + emailCount * 0.05 + dbCount * 0.5);
  const usedBw = Math.min(totalBw, (subdomainCount + emailCount + dbCount) * 0.8);
  const diskPct = Math.min(100, Math.round(usedDisk / totalDisk * 100));
  const bwPct = Math.min(100, Math.round(usedBw / totalBw * 100));

  return (
    <>
      {/* Server status banner */}
      <div
        className="flex items-center gap-4 flex-wrap p-4 rounded-2xl mb-6"
        style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(20,184,166,0.1) 100%)',
          border: '1px solid rgba(16,185,129,0.3)',
        }}
      >
        <span
          className="w-2.5 h-2.5 rounded-full animate-pulse-slow"
          style={{ background: 'var(--success)', boxShadow: '0 0 12px var(--success)' }}
        />
        <span className="font-semibold" style={{ color: 'var(--success)' }}>All Systems Operational</span>
        <div className="ml-auto flex gap-4 text-sm flex-wrap" style={{ color: 'var(--text-muted)' }}>
          <span>🟢 Uptime 99.99%</span>
          <span>⚡ &lt;200ms</span>
          <span>🇸🇬 Singapore DC</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { ic: '🌐', val: hosting.length, label: 'Hosting Aktif', bg: 'rgba(20,184,166,0.1)', cl: 'var(--accent)' },
          { ic: '🔗', val: domains.length, label: 'Domain Terdaftar', bg: 'rgba(99,102,241,0.1)', cl: 'var(--secondary)' },
          { ic: '📄', val: allOrders.length, label: 'Total Invoice', bg: 'rgba(245,158,11,0.1)', cl: 'var(--warning)' },
          { ic: '💰', val: fmtRp(total), label: 'Total Pengeluaran', bg: 'rgba(239,68,68,0.1)', cl: 'var(--danger)' },
        ].map((s) => (
          <div key={s.label} className="card transition-all hover:-translate-y-1">
            <div
              className="w-10 h-10 rounded-xl grid place-items-center text-lg mb-3"
              style={{ background: s.bg, color: s.cl }}
            >
              {s.ic}
            </div>
            <h2 className="font-extrabold text-2xl">{s.val}</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Resource Usage + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5 mb-6">
        <div className="card">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold">📊 Resource Usage</h3>
            <small style={{ color: 'var(--text-muted)' }}>Real-time</small>
          </div>
          {[
            { name: '💾 Disk Space (NVMe SSD)', val: `${usedDisk.toFixed(2)} / ${totalDisk} GB`, pct: diskPct },
            { name: '🌐 Bandwidth (Bulan ini)', val: `${usedBw.toFixed(2)} / ${totalBw} GB`, pct: bwPct },
            { name: '📧 Email Accounts', val: `${emailCount} aktif`, pct: Math.min(100, emailCount * 10) },
            { name: '🗄️ Database MySQL', val: `${dbCount} aktif`, pct: Math.min(100, dbCount * 10) },
            { name: '🔗 Subdomains', val: `${subdomainCount} aktif`, pct: Math.min(100, subdomainCount * 10) },
          ].map((r) => (
            <div key={r.name} className="py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex justify-between mb-2 text-sm">
                <span>{r.name}</span>
                <span style={{ color: 'var(--text-muted)' }}>{r.val}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${r.pct}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <h3 className="text-lg font-bold mb-5">⚡ Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { href: '/dashboard/cpanel', ic: '🛠️', label: 'cPanel' },
              { href: '/dashboard/dns', ic: '🌍', label: 'DNS' },
              { href: '/dashboard/backup', ic: '💾', label: 'Backup' },
              { href: '/dashboard/hosting', ic: '🌐', label: 'Hosting' },
              { href: '/paket', ic: '📈', label: 'Upgrade' },
              { href: '/dashboard/profile', ic: '👤', label: 'Profil' },
            ].map((q) => (
              <Link
                key={q.href}
                href={q.href}
                className="rounded-xl p-3.5 text-center transition-all hover:-translate-y-0.5 flex flex-col items-center gap-1.5"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border)',
                  fontSize: 12,
                }}
              >
                <span className="text-xl">{q.ic}</span>
                <span>{q.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Activity + Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div className="card">
          <h3 className="text-lg font-bold mb-5">🕐 Aktivitas Terbaru</h3>
          {(activities || []).length === 0 ? (
            <div className="text-center py-6 text-sm" style={{ color: 'var(--text-muted)' }}>
              📋 Belum ada aktivitas
            </div>
          ) : (
            (activities || []).map((a) => (
              <div key={a.id} className="flex gap-3.5 py-3" style={{ borderBottom: '1px dashed var(--border)' }}>
                <div
                  className="w-9 h-9 rounded-full grid place-items-center flex-shrink-0 text-base"
                  style={{
                    background:
                      a.color === 'purple' ? 'rgba(99,102,241,0.15)' :
                      a.color === 'orange' ? 'rgba(245,158,11,0.15)' :
                      a.color === 'danger' ? 'rgba(239,68,68,0.15)' :
                      'rgba(20,184,166,0.15)',
                    color:
                      a.color === 'purple' ? 'var(--secondary)' :
                      a.color === 'orange' ? 'var(--warning)' :
                      a.color === 'danger' ? 'var(--danger)' :
                      'var(--accent)',
                  }}
                >
                  {a.icon}
                </div>
                <div className="flex-1">
                  <h5 className="text-sm font-semibold">{a.action}</h5>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{a.description}</p>
                  <time className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{timeAgo(a.created_at)}</time>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-bold mb-5">🔔 Notifikasi Terbaru</h3>
          {(notifications || []).length === 0 ? (
            <div className="text-center py-6 text-sm" style={{ color: 'var(--text-muted)' }}>
              📭 Belum ada notifikasi
            </div>
          ) : (
            (notifications || []).map((n) => (
              <div key={n.id} className="flex gap-3 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: n.is_read ? 'transparent' : 'rgba(20,184,166,0.05)' }}>
                <div
                  className="w-8 h-8 rounded-full grid place-items-center flex-shrink-0 text-sm"
                  style={{ background: 'rgba(20,184,166,0.15)', color: 'var(--accent)' }}
                >
                  {n.icon}
                </div>
                <div className="flex-1">
                  <h5 className="text-sm font-semibold">{n.title}</h5>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{n.description}</p>
                  <time className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{timeAgo(n.created_at)}</time>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent services */}
      <div className="card">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold">📦 Layanan Terbaru</h3>
          <Link href="/paket" className="btn btn-primary">+ Beli Paket</Link>
        </div>
        {allOrders.length === 0 ? (
          <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
            <div className="text-5xl mb-3">📦</div>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--text)' }}>Belum ada layanan</h3>
            <p className="text-sm mb-4">Mulai dengan membeli paket pertama Anda</p>
            <Link href="/paket" className="btn btn-primary">Lihat Paket</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ color: 'var(--text-muted)' }}>
                  <th className="text-left py-3 px-4 uppercase text-xs tracking-wider font-semibold">Layanan</th>
                  <th className="text-left py-3 px-4 uppercase text-xs tracking-wider font-semibold">Tipe</th>
                  <th className="text-left py-3 px-4 uppercase text-xs tracking-wider font-semibold">Tanggal</th>
                  <th className="text-left py-3 px-4 uppercase text-xs tracking-wider font-semibold">Harga</th>
                </tr>
              </thead>
              <tbody>
                {allOrders.slice(0, 5).map((o) => (
                  <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-3 px-4 font-semibold">{o.name}</td>
                    <td className="py-3 px-4">{o.type.toUpperCase()}</td>
                    <td className="py-3 px-4">{new Date(o.created_at).toLocaleDateString('id-ID')}</td>
                    <td className="py-3 px-4">{fmtRp(o.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
