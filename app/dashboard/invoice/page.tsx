import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { fmtDate, fmtRp } from '@/lib/data';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Riwayat Invoice',
  description: 'Riwayat tagihan dan pembayaran Anda.',
};

export default async function InvoicePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="card">
      <h3 className="text-lg font-bold mb-5">📄 Riwayat Invoice</h3>
      {(orders || []).length === 0 ? (
        <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
          <div className="text-5xl mb-3">📄</div>
          <h3 className="font-semibold mb-2" style={{ color: 'var(--text)' }}>Belum ada invoice</h3>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: 'var(--text-muted)' }}>
                <th className="text-left py-3 px-4 uppercase text-xs">No. Invoice</th>
                <th className="text-left py-3 px-4 uppercase text-xs">Layanan</th>
                <th className="text-left py-3 px-4 uppercase text-xs">Tanggal</th>
                <th className="text-left py-3 px-4 uppercase text-xs">Total</th>
                <th className="text-left py-3 px-4 uppercase text-xs">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders!.map((o) => (
                <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="py-3 px-4 font-semibold">INV-{String(o.id).padStart(6, '0')}</td>
                  <td className="py-3 px-4">{o.name} ({o.type})</td>
                  <td className="py-3 px-4">{fmtDate(o.created_at)}</td>
                  <td className="py-3 px-4">{fmtRp(o.price)}</td>
                  <td className="py-3 px-4"><span className="status status-active">Lunas</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
