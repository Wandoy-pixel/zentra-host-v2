'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';
import { sendContactMessage } from '@/app/actions/resources';
import { showToast } from '@/components/ToastProvider';
import type { User } from '@supabase/supabase-js';

const FAQS = [
  { q: 'Bagaimana cara mendaftar di Zentra?', a: 'Klik "Daftar" di pojok kanan atas, isi formulir, dan akun langsung aktif tanpa verifikasi manual.' },
  { q: 'Berapa lama proses aktivasi hosting?', a: 'Otomatis setelah pembayaran terkonfirmasi, biasanya kurang dari 60 detik.' },
  { q: 'Apakah ada garansi uang kembali?', a: 'Ya, garansi 30 hari untuk semua paket shared hosting tanpa pertanyaan.' },
  { q: 'Apakah bisa upgrade paket di kemudian hari?', a: 'Tentu! Upgrade kapan saja melalui dashboard, bayar selisihnya saja.' },
  { q: 'Metode pembayaran apa saja yang tersedia?', a: 'Transfer bank (BCA, Mandiri, BNI, BRI), e-wallet (GoPay, OVO, DANA), QRIS.' },
];

export default function KontakPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const result = await sendContactMessage({
      name: String(fd.get('name')),
      email: String(fd.get('email')),
      subject: String(fd.get('subject')),
      message: String(fd.get('message')),
    });
    if (result.error) showToast('Gagal kirim: ' + result.error, 'error');
    else {
      showToast('✓ Pesan terkirim! Tim kami akan merespon dalam 1x24 jam.', 'success');
      e.currentTarget.reset();
    }
    setLoading(false);
  }

  return (
    <>
      <Navbar user={user} />

      <section className="pt-20 pb-10 px-6 text-center">
        <div className="max-w-[1240px] mx-auto">
          <h1 className="font-extrabold mb-3" style={{ fontSize: 'clamp(32px, 5vw, 52px)', letterSpacing: '-1.5px' }}>
            Hubungi <span className="gradient-text">tim kami</span>
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Tim support tersedia 24/7</p>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-[1240px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6">
          <div className="rounded-2xl p-8 text-white" style={{ background: 'var(--gradient)' }}>
            <h3 className="text-2xl mb-5 font-bold">Info Kontak</h3>
            {[
              { ic: '📧', t: 'Email', p: ['support@zentra.id', 'sales@zentra.id'] },
              { ic: '📱', t: 'Telepon / WhatsApp', p: ['+62 812-3456-7890'] },
              { ic: '📍', t: 'Kantor Pusat', p: ['Jl. Sudirman No. 123', 'Jakarta Pusat 10220', 'Indonesia'] },
              { ic: '🕐', t: 'Jam Operasional', p: ['Support: 24/7', 'Sales: Senin–Jumat 09.00–17.00'] },
            ].map((c) => (
              <div key={c.t} className="flex gap-3.5 mb-5">
                <div
                  className="w-10 h-10 rounded-xl grid place-items-center text-base flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                >
                  {c.ic}
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">{c.t}</h4>
                  {c.p.map((line) => (
                    <p key={line} className="text-xs opacity-90">{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <h2 className="text-xl mb-6 font-bold">📨 Kirim Pesan</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>Nama Lengkap</label>
                <input type="text" name="name" required className="input" />
              </div>
              <div className="mb-4">
                <label className="block mb-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>Email</label>
                <input type="email" name="email" required className="input" />
              </div>
              <div className="mb-4">
                <label className="block mb-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>Subjek</label>
                <select name="subject" required className="input">
                  <option value="">-- Pilih subjek --</option>
                  <option>Pertanyaan Umum</option>
                  <option>Bantuan Teknis</option>
                  <option>Informasi Paket</option>
                  <option>Komplain</option>
                  <option>Kerja Sama</option>
                </select>
              </div>
              <div className="mb-5">
                <label className="block mb-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>Pesan</label>
                <textarea name="message" rows={5} required className="input" />
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary btn-lg btn-block">
                {loading ? '⏳ Mengirim...' : 'Kirim Pesan →'}
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-[760px] mx-auto">
          <h2 className="text-center text-3xl font-extrabold mb-10">Pertanyaan Yang Sering Ditanyakan</h2>
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="mb-2.5 p-5 rounded-2xl cursor-pointer"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <summary className="font-semibold list-none flex justify-between items-center">
                {f.q}
              </summary>
              <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
