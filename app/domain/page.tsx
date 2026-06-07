'use client';

import { useEffect, useState, useTransition } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { DOMAIN_PRICES } from '@/lib/data';
import { createClient } from '@/lib/supabase/client';
import { searchDomain, type SearchDomainResult } from '@/app/actions/domain';
import type { User } from '@supabase/supabase-js';

export default function DomainPage() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [ext, setExt] = useState('.com');
  const [result, setResult] = useState<SearchDomainResult | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = name.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
    if (clean.length < 2) return;
    startTransition(async () => {
      const res = await searchDomain(clean, ext);
      setResult(res);
    });
  };

  return (
    <>
      <Navbar user={user} />
      <section className="pt-20 pb-10 px-6 text-center">
        <div className="max-w-[1240px] mx-auto">
          <h1 className="font-extrabold mb-3" style={{ fontSize: 'clamp(32px, 5vw, 52px)', letterSpacing: '-1.5px' }}>
            Cari domain <span className="gradient-text">impianmu</span>
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Mulai dari Rp 50.000/tahun</p>
        </div>
      </section>

      <section className="px-6 pb-10">
        <div className="max-w-[700px] mx-auto card">
          <form onSubmit={handleSearch} className="flex gap-2 flex-wrap">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="contoh: bisnisku"
              required
              className="input flex-1 min-w-[200px]"
              disabled={isPending}
            />
            <select
              value={ext}
              onChange={(e) => setExt(e.target.value)}
              className="input min-w-[120px]"
              disabled={isPending}
            >
              {DOMAIN_PRICES.map((d) => (
                <option key={d.ext} value={d.ext}>{d.ext}</option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary" disabled={isPending}>
              {isPending ? 'Mengecek…' : 'Cek →'}
            </button>
          </form>

          {result && !isPending && (
            <div
              className="mt-5 p-4 rounded-lg"
              style={{
                background: result.available ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: '1px solid ' + (result.available ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'),
                color: result.available ? '#34d399' : '#f87171',
              }}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  {result.available ? (
                    <>
                      <strong>✓ Domain {result.full} tersedia</strong><br />
                      Harga: Rp {result.price.toLocaleString('id-ID')}/tahun
                    </>
                  ) : (
                    <>
                      <strong>✗ Maaf, {result.full} sudah terdaftar</strong><br />
                      Coba kombinasi nama atau ekstensi lain.
                    </>
                  )}
                </div>
                <span
                  className="text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap"
                  title={
                    result.source === 'dns'
                      ? 'Hasil berasal dari DNS lookup real-time'
                      : 'Hasil estimasi (DNS lookup tidak tersedia)'
                  }
                  style={{
                    background:
                      result.source === 'dns'
                        ? 'rgba(59,130,246,0.15)'
                        : 'rgba(234,179,8,0.15)',
                    color:
                      result.source === 'dns' ? '#60a5fa' : '#facc15',
                    border:
                      '1px solid ' +
                      (result.source === 'dns'
                        ? 'rgba(59,130,246,0.3)'
                        : 'rgba(234,179,8,0.3)'),
                  }}
                >
                  {result.source === 'dns' ? '🔎 DNS Lookup' : '⚠ Estimated'}
                </span>
              </div>
              {result.error && (
                <div className="mt-2 text-xs opacity-80">{result.error}</div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-[1240px] mx-auto">
          <h2 className="text-center font-extrabold mb-10 text-3xl">Harga Semua Ekstensi</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {DOMAIN_PRICES.map((d) => (
              <div key={d.ext} className="card">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-3xl font-extrabold" style={{ color: 'var(--accent)', letterSpacing: '-1px' }}>
                    {d.ext}
                  </h3>
                  {d.popular && <span className="status status-active">POPULER</span>}
                </div>
                <p className="mb-5 text-sm" style={{ color: 'var(--text-muted)' }}>{d.desc}</p>
                <div className="text-xl font-extrabold">
                  Rp {d.price.toLocaleString('id-ID')}
                  <small className="text-xs ml-1 font-normal" style={{ color: 'var(--text-muted)' }}>/tahun</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
