'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';
import { createOrder } from '@/app/actions/orders';
import { createPaymentSession } from '@/app/actions/payment';
import { fmtRp } from '@/lib/data';
import { showToast } from '@/components/ToastProvider';
import type { User } from '@supabase/supabase-js';

declare global {
  interface Window {
    snap?: {
      pay(
        token: string,
        callbacks: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        }
      ): void;
    };
  }
}

const PERIODS = [
  { months: 1, label: '1 Bulan', discount: 0 },
  { months: 3, label: '3 Bulan', discount: 5 },
  { months: 6, label: '6 Bulan', discount: 10 },
  { months: 12, label: '12 Bulan', discount: 20 },
];

const MIDTRANS_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '';
const MIDTRANS_IS_PRODUCTION = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';
const MIDTRANS_SNAP_URL = MIDTRANS_IS_PRODUCTION
  ? 'https://app.midtrans.com/snap/snap.js'
  : 'https://app.sandbox.midtrans.com/snap/snap.js';

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center" style={{ color: 'var(--text-muted)' }}>Memuat checkout...</div>}>
      {MIDTRANS_CLIENT_KEY && (
        <Script
          src={MIDTRANS_SNAP_URL}
          data-client-key={MIDTRANS_CLIENT_KEY}
          strategy="lazyOnload"
        />
      )}
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [period, setPeriod] = useState(1);
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const name = searchParams.get('name') || 'Paket Hosting';
  const type = (searchParams.get('type') || 'shared') as 'shared' | 'cloud' | 'vps' | 'domain';
  const basePrice = parseInt(searchParams.get('price') || '0');

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      setUser(data.user);
      // Prefill nama dari user metadata kalau ada
      const meta = data.user?.user_metadata as { full_name?: string; fullname?: string; phone?: string } | undefined;
      if (meta?.full_name) setFullname(meta.full_name);
      else if (meta?.fullname) setFullname(meta.fullname);
      if (meta?.phone) setPhone(meta.phone);
    });
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
    if (!fullname.trim()) {
      showToast('Nama lengkap wajib diisi', 'error');
      return;
    }
    if (!phone.trim()) {
      showToast('Nomor HP wajib diisi', 'error');
      return;
    }

    setLoading(true);

    // Step 1: buat order di DB
    const orderResult = await createOrder({
      name,
      type,
      period,
      price: total,
      payment: 'midtrans',
    });
    if ('error' in orderResult) {
      showToast('Gagal membuat order: ' + orderResult.error, 'error');
      setLoading(false);
      return;
    }
    const orderId = orderResult.orderId;
    const invoiceNo = orderResult.invoiceNo;

    // Fallback: tidak ada client key → skip Midtrans, langsung sukses (flow lama)
    if (!MIDTRANS_CLIENT_KEY) {
      showToast(`🎉 Order dibuat! Invoice ${invoiceNo}`, 'success');
      setTimeout(() => router.push('/dashboard'), 1500);
      return;
    }

    // Step 2: minta Snap token
    const payResult = await createPaymentSession(
      orderId,
      total,
      fullname,
      user.email || '',
      phone
    );
    if ('error' in payResult) {
      showToast('Gagal membuat sesi pembayaran: ' + payResult.error, 'error');
      setLoading(false);
      return;
    }

    // Step 3: buka Snap popup
    if (typeof window === 'undefined' || !window.snap) {
      showToast('Snap belum siap, coba refresh halaman', 'error');
      setLoading(false);
      return;
    }

    window.snap.pay(payResult.snapToken, {
      onSuccess: () => {
        showToast('🎉 Pembayaran berhasil!', 'success');
        router.push('/dashboard/invoice?success=1');
      },
      onPending: () => {
        showToast('⏳ Pembayaran menunggu konfirmasi', 'success');
        router.push('/dashboard/invoice?pending=1');
      },
      onError: () => {
        showToast('Pembayaran gagal, silakan coba lagi', 'error');
        setLoading(false);
      },
      onClose: () => {
        showToast('Pembayaran dibatalkan', 'error');
        setLoading(false);
      },
    });
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
          <div className="mb-4">
            <label className="block mb-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>Nama Lengkap</label>
            <input
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              required
              placeholder="Nama sesuai identitas"
              className="input"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>Nomor HP</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="08xxxxxxxxxx"
              type="tel"
              className="input"
            />
          </div>

          <h2 className="text-xl mb-4 mt-8 font-bold">💳 Pembayaran</h2>
          <div
            className="p-4 rounded-lg mb-5"
            style={{ background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.25)' }}
          >
            <p className="text-sm mb-2">
              🔒 Pembayaran aman via <strong>Midtrans</strong> (Mandiri, BCA, GoPay, OVO, QRIS, dll)
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {['Bank', 'GoPay', 'OVO', 'DANA', 'QRIS'].map((m) => (
                <span
                  key={m}
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-muted)',
                  }}
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading || !user} className="btn btn-primary btn-lg btn-block">
            {loading ? '⏳ Memproses pembayaran...' : 'Lanjutkan ke Pembayaran →'}
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
