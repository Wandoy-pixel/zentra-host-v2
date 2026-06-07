import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { fmtRp } from '@/lib/data';
import { adminSuspendCustomer } from '@/app/actions/admin';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin · Customers — Zentra Host',
  description: 'Kelola seluruh customer Zentra Host.',
};

export default async function AdminCustomersPage() {
  const supabase = createClient();

  // DOUBLE-CHECK role admin (server-side, jangan trust client)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: meProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (!meProfile || meProfile.role !== 'admin') redirect('/dashboard');

  // Fetch customers
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, fullname, phone, role, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  // Fetch aggregated orders
  const { data: allOrders } = await supabase
    .from('orders')
    .select('user_id, price');

  // Aggregate orders per user
  const orderStats: Record<string, { count: number; total: number }> = {};
  (allOrders || []).forEach((o: any) => {
    if (!orderStats[o.user_id]) orderStats[o.user_id] = { count: 0, total: 0 };
    orderStats[o.user_id].count += 1;
    orderStats[o.user_id].total += Number(o.price || 0);
  });

  // Fetch auth.users emails via admin API not available with anon client.
  // Workaround: profiles table tidak punya email kolom, jadi tampilkan via user_id snippet.
  // Kalau kamu tambahin kolom email di profiles, akan auto pick up dari fullname/phone.
  const customers = profiles || [];
  const totalRevenue = Object.values(orderStats).reduce((s, v) => s + v.total, 0);
  const activeCustomers = customers.filter((c) => orderStats[c.id]?.count > 0).length;

  async function suspendAction(formData: FormData) {
    'use server';
    const id = String(formData.get('userId') || '');
    if (!id) return;
    await adminSuspendCustomer(id);
  }

  return (
    <>
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Total Customers
          </p>
          <h2 className="font-extrabold text-2xl">{customers.length}</h2>
        </div>
        <div className="card">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Active Customers
          </p>
          <h2 className="font-extrabold text-2xl">{activeCustomers}</h2>
        </div>
        <div className="card">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Total Revenue
          </p>
          <h2 className="font-extrabold text-2xl">{fmtRp(totalRevenue)}</h2>
        </div>
        <div className="card">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Avg Spend / Customer
          </p>
          <h2 className="font-extrabold text-2xl">
            {fmtRp(activeCustomers ? Math.round(totalRevenue / activeCustomers) : 0)}
          </h2>
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold">👥 Manage Customers</h3>
          <small style={{ color: 'var(--text-muted)' }}>
            Menampilkan {customers.length} terbaru
          </small>
        </div>

        {customers.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            <div className="text-5xl mb-3">👥</div>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--text)' }}>
              Belum ada customer
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
                    Name
                  </th>
                  <th className="text-left py-3 px-4 uppercase text-xs tracking-wider font-semibold">
                    Phone
                  </th>
                  <th className="text-left py-3 px-4 uppercase text-xs tracking-wider font-semibold">
                    Role
                  </th>
                  <th className="text-left py-3 px-4 uppercase text-xs tracking-wider font-semibold">
                    Joined
                  </th>
                  <th className="text-left py-3 px-4 uppercase text-xs tracking-wider font-semibold">
                    Orders
                  </th>
                  <th className="text-left py-3 px-4 uppercase text-xs tracking-wider font-semibold">
                    Total Spent
                  </th>
                  <th className="text-left py-3 px-4 uppercase text-xs tracking-wider font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c: any) => {
                  const stats = orderStats[c.id] || { count: 0, total: 0 };
                  const isAdmin = c.role === 'admin';
                  const isSuspended = c.role === 'suspended';
                  return (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="py-3 px-4 font-mono text-[10px]">
                        {String(c.id).slice(0, 8)}…
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        {c.fullname || (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                        {c.phone || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="text-[10px] font-bold px-2 py-1 rounded-md uppercase"
                          style={{
                            background: isAdmin
                              ? 'rgba(239,68,68,0.15)'
                              : isSuspended
                                ? 'rgba(245,158,11,0.15)'
                                : 'rgba(20,184,166,0.15)',
                            color: isAdmin
                              ? '#ef4444'
                              : isSuspended
                                ? 'var(--warning)'
                                : 'var(--accent)',
                          }}
                        >
                          {c.role || 'customer'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                        {new Date(c.created_at).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4">{stats.count}</td>
                      <td className="py-3 px-4 font-semibold">{fmtRp(stats.total)}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2 items-center">
                          <span
                            className="text-xs px-2 py-1 rounded-md cursor-not-allowed opacity-60"
                            style={{
                              background: 'rgba(99,102,241,0.1)',
                              color: 'var(--secondary)',
                              border: '1px solid rgba(99,102,241,0.2)',
                            }}
                            title="Detail page (next iteration)"
                          >
                            View
                          </span>
                          {!isAdmin && !isSuspended && (
                            <form action={suspendAction}>
                              <input type="hidden" name="userId" value={c.id} />
                              <button
                                type="submit"
                                className="text-xs px-2 py-1 rounded-md cursor-pointer"
                                style={{
                                  background: 'rgba(239,68,68,0.1)',
                                  color: '#ef4444',
                                  border: '1px solid rgba(239,68,68,0.2)',
                                  fontFamily: 'inherit',
                                }}
                              >
                                Suspend
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
