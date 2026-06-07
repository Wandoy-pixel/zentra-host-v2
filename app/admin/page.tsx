import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { fmtRp } from '@/lib/data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Overview — Zentra Host',
  description: 'Statistik dan ringkasan operasional Zentra Host.',
};

export default async function AdminOverview() {
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

  // Date ranges
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Parallel fetch
  const [
    { count: totalCustomers },
    { data: ordersToday },
    { data: ordersMonth },
    { count: pendingPayments },
    { count: activeServices },
    { count: openTickets },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('orders').select('id, price').gte('created_at', startOfToday),
    supabase.from('orders').select('id, price').gte('created_at', startOfMonth),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .or('payment.is.null,payment.eq.pending'),
    supabase
      .from('provisioning_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .in('status', ['open', 'pending']),
    supabase
      .from('orders')
      .select('id, name, type, price, payment, created_at, user_id, profiles(fullname)')
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  const ordersTodayCount = (ordersToday || []).length;
  const ordersMonthCount = (ordersMonth || []).length;
  const revenueToday = (ordersToday || []).reduce((s, o: any) => s + Number(o.price || 0), 0);
  const revenueMonth = (ordersMonth || []).reduce((s, o: any) => s + Number(o.price || 0), 0);

  const stats = [
    {
      ic: '👥',
      val: totalCustomers || 0,
      label: 'Total Customers',
      sub: 'Registered users',
      bg: 'rgba(20,184,166,0.1)',
      cl: 'var(--accent)',
    },
    {
      ic: '🛒',
      val: ordersTodayCount,
      label: 'Orders Hari Ini',
      sub: `${ordersMonthCount} bulan ini`,
      bg: 'rgba(99,102,241,0.1)',
      cl: 'var(--secondary)',
    },
    {
      ic: '💰',
      val: fmtRp(revenueToday),
      label: 'Revenue Hari Ini',
      sub: `${fmtRp(revenueMonth)} bulan ini`,
      bg: 'rgba(16,185,129,0.1)',
      cl: 'var(--success)',
    },
    {
      ic: '⏳',
      val: pendingPayments || 0,
      label: 'Pending Payments',
      sub: 'Belum lunas',
      bg: 'rgba(245,158,11,0.1)',
      cl: 'var(--warning)',
    },
  ];

  const secondary = [
    {
      ic: '🟢',
      val: activeServices || 0,
      label: 'Active Services',
      cl: 'var(--success)',
    },
    {
      ic: '🎫',
      val: openTickets || 0,
      label: 'Open Tickets',
      cl: 'var(--warning)',
    },
    {
      ic: '📈',
      val: ordersMonthCount,
      label: 'Orders Bulan Ini',
      cl: 'var(--secondary)',
    },
    {
      ic: '💵',
      val: fmtRp(revenueMonth),
      label: 'Revenue Bulan Ini',
      cl: 'var(--accent)',
    },
  ];

  return (
    <>
      {/* Admin banner */}
      <div
        className="flex items-center gap-4 flex-wrap p-4 rounded-2xl mb-6"
        style={{
          background: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(185,28,28,0.1) 100%)',
          border: '1px solid rgba(239,68,68,0.3)',
        }}
      >
        <span
          className="w-2.5 h-2.5 rounded-full animate-pulse-slow"
          style={{ background: '#ef4444', boxShadow: '0 0 12px #ef4444' }}
        />
        <span className="font-semibold" style={{ color: '#ef4444' }}>
          🔒 Owner Mode Active
        </span>
        <div
          className="ml-auto flex gap-4 text-sm flex-wrap"
          style={{ color: 'var(--text-muted)' }}
        >
          <span>👤 {user.email}</span>
          <span>🕐 {new Date().toLocaleString('id-ID')}</span>
        </div>
      </div>

      {/* Primary stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="card transition-all hover:-translate-y-1">
            <div
              className="w-10 h-10 rounded-xl grid place-items-center text-lg mb-3"
              style={{ background: s.bg, color: s.cl }}
            >
              {s.ic}
            </div>
            <h2 className="font-extrabold text-2xl">{s.val}</h2>
            <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
              {s.label}
            </p>
            <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
              {s.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Charts placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <div className="card">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold">📈 Revenue Trend (30 Hari)</h3>
            <small style={{ color: 'var(--text-muted)' }}>Chart placeholder</small>
          </div>
          <div
            className="rounded-xl flex items-end justify-around p-5 gap-2"
            style={{
              height: 200,
              background: 'rgba(20,184,166,0.05)',
              border: '1px dashed var(--border)',
            }}
          >
            {[40, 65, 50, 80, 45, 70, 90, 60, 75, 85, 55, 95].map((h, i) => (
              <div
                key={i}
                className="rounded-t-md flex-1 transition-all hover:opacity-80"
                style={{
                  height: `${h}%`,
                  background: 'var(--gradient)',
                  minWidth: 8,
                }}
                title={`Day ${i + 1}: ${h}%`}
              />
            ))}
          </div>
          <p className="text-xs text-center mt-3" style={{ color: 'var(--text-muted)' }}>
            Total: {fmtRp(revenueMonth)} · Avg: {fmtRp(Math.round(revenueMonth / 30))}/hari
          </p>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold">🥧 Distribusi Layanan</h3>
            <small style={{ color: 'var(--text-muted)' }}>Chart placeholder</small>
          </div>
          <div
            className="rounded-xl grid place-items-center p-5"
            style={{
              height: 200,
              background: 'rgba(99,102,241,0.05)',
              border: '1px dashed var(--border)',
            }}
          >
            <div className="grid grid-cols-2 gap-3 text-sm w-full">
              {secondary.map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg p-3 flex items-center gap-3"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}
                >
                  <span className="text-xl">{s.ic}</span>
                  <div>
                    <div className="font-extrabold text-sm" style={{ color: s.cl }}>
                      {s.val}
                    </div>
                    <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {s.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent orders table */}
      <div className="card">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold">🛒 Recent Orders</h3>
          <Link href="/admin/orders" className="btn btn-primary">
            Lihat Semua →
          </Link>
        </div>
        {(recentOrders || []).length === 0 ? (
          <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
            <div className="text-5xl mb-3">📭</div>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--text)' }}>
              Belum ada order
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
                    Customer
                  </th>
                  <th className="text-left py-3 px-4 uppercase text-xs tracking-wider font-semibold">
                    Service
                  </th>
                  <th className="text-left py-3 px-4 uppercase text-xs tracking-wider font-semibold">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 uppercase text-xs tracking-wider font-semibold">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 uppercase text-xs tracking-wider font-semibold">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {(recentOrders || []).map((o: any) => {
                  const paid = o.payment && o.payment !== 'pending';
                  return (
                    <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="py-3 px-4 font-mono text-xs">
                        #{String(o.id).padStart(6, '0')}
                      </td>
                      <td className="py-3 px-4">
                        {o.profiles?.fullname || '—'}
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        {o.name}{' '}
                        <span className="text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>
                          {o.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">{fmtRp(o.price)}</td>
                      <td className="py-3 px-4">
                        <span
                          className="text-[10px] font-bold px-2 py-1 rounded-md uppercase"
                          style={{
                            background: paid ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                            color: paid ? 'var(--success)' : 'var(--warning)',
                          }}
                        >
                          {paid ? 'PAID' : 'PENDING'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                        {new Date(o.created_at).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
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
