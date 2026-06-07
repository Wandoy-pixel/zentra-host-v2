import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { fmtRp } from '@/lib/data';
import { adminMarkOrderPaid } from '@/app/actions/admin';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin · Orders — Zentra Host',
  description: 'Kelola seluruh order pelanggan.',
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams?: { filter?: string };
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

  const filter = searchParams?.filter || 'all';

  let query = supabase
    .from('orders')
    .select('id, name, type, period, price, payment, created_at, user_id, profiles(fullname)')
    .order('created_at', { ascending: false });

  if (filter === 'paid') {
    query = query.not('payment', 'is', null).neq('payment', 'pending');
  } else if (filter === 'pending') {
    query = query.or('payment.is.null,payment.eq.pending');
  }

  const { data: orders } = await query.limit(200);

  const all = orders || [];
  const totalRevenue = all.reduce((s, o: any) => s + Number(o.price || 0), 0);

  const filters = [
    { key: 'all', label: 'Semua', count: undefined },
    { key: 'paid', label: 'Lunas', count: undefined },
    { key: 'pending', label: 'Pending', count: undefined },
  ];

  async function markPaidAction(formData: FormData) {
    'use server';
    const id = Number(formData.get('orderId'));
    if (!id) return;
    await adminMarkOrderPaid(id);
  }

  return (
    <>
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Total Orders (ditampilkan)
          </p>
          <h2 className="font-extrabold text-2xl">{all.length}</h2>
        </div>
        <div className="card">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Total Revenue (ditampilkan)
          </p>
          <h2 className="font-extrabold text-2xl">{fmtRp(totalRevenue)}</h2>
        </div>
        <div className="card">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Filter aktif
          </p>
          <h2 className="font-extrabold text-2xl uppercase">{filter}</h2>
        </div>
      </div>

      {/* Filter */}
      <div className="card mb-6">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <h3 className="text-lg font-bold">🛒 Manage Orders</h3>
          <div className="flex gap-2 flex-wrap">
            {filters.map((f) => (
              <Link
                key={f.key}
                href={`/admin/orders?filter=${f.key}`}
                className="text-xs font-semibold px-3 py-2 rounded-lg uppercase tracking-wider"
                style={{
                  background:
                    filter === f.key ? 'rgba(20,184,166,0.15)' : 'rgba(255,255,255,0.04)',
                  color: filter === f.key ? 'var(--accent)' : 'var(--text-muted)',
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
        {all.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            <div className="text-5xl mb-3">📦</div>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--text)' }}>
              Tidak ada order untuk filter ini
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
                  <th className="text-left py-3 px-4 uppercase text-xs tracking-wider font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {all.map((o: any) => {
                  const paid = o.payment && o.payment !== 'pending';
                  return (
                    <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="py-3 px-4 font-mono text-xs">
                        #{String(o.id).padStart(6, '0')}
                      </td>
                      <td className="py-3 px-4">{o.profiles?.fullname || '—'}</td>
                      <td className="py-3 px-4 font-semibold">
                        {o.name}{' '}
                        <span
                          className="text-[10px] uppercase"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          ({o.type})
                        </span>
                      </td>
                      <td className="py-3 px-4">{fmtRp(o.price)}</td>
                      <td className="py-3 px-4">
                        <span
                          className="text-[10px] font-bold px-2 py-1 rounded-md uppercase"
                          style={{
                            background: paid
                              ? 'rgba(16,185,129,0.15)'
                              : 'rgba(245,158,11,0.15)',
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
                      <td className="py-3 px-4">
                        <div className="flex gap-2 items-center">
                          <Link
                            href={`/dashboard/invoice/${o.id}`}
                            className="text-xs px-2 py-1 rounded-md"
                            style={{
                              background: 'rgba(99,102,241,0.1)',
                              color: 'var(--secondary)',
                              border: '1px solid rgba(99,102,241,0.2)',
                            }}
                          >
                            View
                          </Link>
                          {!paid && (
                            <form action={markPaidAction}>
                              <input type="hidden" name="orderId" value={o.id} />
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
                                Mark Paid
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
