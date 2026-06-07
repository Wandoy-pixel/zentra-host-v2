'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';
import { createOrder } from '@/app/actions/orders';
import { fmtRp } from '@/lib/data';
import { showToast } from '@/components/ToastProvider';
import type { User } from '@supabase/supabase-js';

const PERIODS = [
  { months: 1, label: '1 Bulan', discount: 0 },
  { months: 3, label: '3 Bulan', discount: 5 },
  { months: 6, label: '6 Bulan', discount: 10 },
  { months: 12, label: '12 Bulan', discount: 20 },
];

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center" style={{ color: 'var(--text-muted)' }}>Memuat checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [period, setPeriod] = useState(1);
  const [payment, setPayment] = useState('');
  const [loading, setLoading] = useState(false);

  const name = searchParams.get('name') || 'Paket Hosting';
  const type = (searchParams.get('type') || 'shared') as 'shared' | 'cloud' | 'vps' | 'domain';
  const basePrice = parseInt(searchParams.get('price') || '0');

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const periodData = PERIODS.find((p) => p.months === period)!;
  const subtotal = basePrice * (type === 'domain' ? 1 : period);
  const discount = type === 'domain' ? 0 : subtotal * (periodData.discount / 100);
  const ppn = (subtotal - discount) * 0.11;
  const total = Math.round(subtotal - discount + ppn);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) {
      showToast('Anda harus login dulu', 'error');
      router.push('/login');
      return;
    }
    if (!payment) {
      showToast('Pilih metode pembayaran', 'error');
      return;
    }
    setLoading(true);
    const result = await createOrder({ name, type, period, price: total, payment });
    if ('error' in result) {
      showToast('Gagal: ' + result.error, 'error');
      setLoading(false);
      return;
    }
    showToast(`🎉 Pembayaran berhasil! Invoice ${result.invoiceNo}`, 'success');
    setTimeout(() => router.push('/dashboard'), 1500);
  }

  return (
    <>
      <Navbar user={user} />

      <section className="pt-20 pb-10 px-6 text-center">
        <div className="max-w-[1240px] mx-auto">
          <h1 className="font-extrabold mb-3" style={{ fontSize: 'clamp(32px, 5vw, 52px)', letterSpacing: '-1.5px' }}>
            Checkout
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Selesaikan pembayaran untuk mengaktifkan layanan</p>
        </div>
      </section>

      <div className="max-w-[1240px] mx-auto px-6 pb-20 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        <form onSubmit={handleSubmit} className="card">
          <h2 className="text-xl mb-6 font-bold">📋 Informasi Pemesan</h2>
          <div className="mb-4">
            <label className="block mb-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>Email</label>
            <input value={user?.email || ''} disabled className="input" />
          </div>
          <h2 className="text-xl mb-6 mt-8 font-bold">💳 Pembayaran</h2>
          <div className="mb-5">
            <label className="block mb-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>Metode Pembayaran</label>
            <select value={payment} onChange={(e) => setPayment(e.target.value)} required className="input">
              <option value="">-- Pilih metode --</option>
              <option value="bca">Transfer BCA</option>
              <option value="mandiri">Transfer Mandiri</option>
              <option value="bni">Transfer BNI</option>
              <option value="bri">Transfer BRI</option>
              <option value="gopay">GoPay</option>
              <option value="ovo">OVO</option>
              <option value="dana">DANA</option>
              <option value="qris">QRIS</option>
            </select>
          </div>
          <button type="submit" disabled={loading || !user} className="btn btn-primary btn-lg btn-block">
            {loading ? '⏳ Memproses pembayaran...' : 'Bayar Sekarang →'}
          </button>
          {!user && (
            <p className="text-sm mt-4 text-center" style={{ color: 'var(--text-muted)' }}>
              <Link href="/login" className="font-semibold" style={{ color: 'var(--accent)' }}>Login</Link> dulu untuk melakukan pembelian
            </p>
          )}
        </form>

        <div className="card h-fit sticky top-5">
          <h2 className="text-xl mb-6 font-bold">🛒 Ringkasan</h2>
          <div
            className="p-4 rounded-lg mb-5"
            style={{ background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.3)' }}
          >
            <h4 className="font-semibold mb-1" style={{ color: 'var(--accent)' }}>{name}</h4>
            <small style={{ color: 'var(--text-muted)' }}>Tipe: {type.toUpperCase()}</small>
          </div>

          {type !== 'domain' && (
            <div className="mb-5">
              <label className="block mb-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>Periode</label>
              <select value={period} onChange={(e) => setPeriod(parseInt(e.target.value))} className="input">
                {PERIODS.map((p) => (
                  <option key={p.months} value={p.months}>
                    {p.label}{p.discount > 0 ? ` (Hemat ${p.discount}%)` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-between text-sm py-3">
            <span>Harga ({type === 'domain' ? '1 tahun' : `${period}x`})</span>
            <span>{fmtRp(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm py-3" style={{ color: '#34d399' }}>
              <span>Diskon {periodData.discount}%</span>
              <span>− {fmtRp(discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm py-3">
            <span>PPN 11%</span>
            <span>{fmtRp(Math.round(ppn))}</span>
          </div>
          <div className="flex justify-between text-xl font-extrabold py-4 mt-3" style={{ borderTop: '1px solid var(--border)', color: 'var(--accent)' }}>
            <span>Total</span>
            <span>{fmtRp(total)}</span>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
