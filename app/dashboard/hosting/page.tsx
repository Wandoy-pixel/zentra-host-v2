import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { fmtDate, fmtRp } from '@/lib/data';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Hosting Saya',
  description: 'Kelola paket hosting aktif Anda.',
};

export default async function HostingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .neq('type', 'domain')
    .order('created_at', { ascending: false });

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold">🌐 Hosting Saya</h3>
        <Link href="/paket" className="btn btn-primary">+ Hosting Baru</Link>
      </div>
      {(orders || []).length === 0 ? (
        <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
          <div className="text-5xl mb-3">🌐</div>
          <h3 className="font-semibold mb-2" style={{ color: 'var(--text)' }}>Belum ada hosting</h3>
          <p className="text-sm">Pilih paket untuk memulai</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: 'var(--text-muted)' }}>
                <th className="text-left py-3 px-4 uppercase text-xs">Paket</th>
                <th className="text-left py-3 px-4 uppercase text-xs">Tipe</th>
                <th className="text-left py-3 px-4 uppercase text-xs">Periode</th>
                <th className="text-left py-3 px-4 uppercase text-xs">Mulai</th>
                <th className="text-left py-3 px-4 uppercase text-xs">Harga</th>
                <th className="text-left py-3 px-4 uppercase text-xs">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders!.map((o) => (
                <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="py-3 px-4 font-semibold">{o.name}</td>
                  <td className="py-3 px-4">{o.type.toUpperCase()}</td>
                  <td className="py-3 px-4">{o.period} bulan</td>
                  <td className="py-3 px-4">{fmtDate(o.created_at)}</td>
                  <td className="py-3 px-4">{fmtRp(o.price)}</td>
                  <td className="py-3 px-4"><span className="status status-active">Aktif</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
