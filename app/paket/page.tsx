'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { PAKET_DATA, fmtRp } from '@/lib/data';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

type PaketType = 'shared' | 'cloud' | 'vps';

export default function PaketPage() {
  const [type, setType] = useState<PaketType>('shared');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const paket = PAKET_DATA[type];

  return (
    <>
      <Navbar user={user} />

      <section className="pt-20 pb-10 px-6">
        <div className="max-w-[1240px] mx-auto text-center">
          <span
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium mb-6"
            style={{
              background: 'rgba(20,184,166,0.1)',
              border: '1px solid rgba(20,184,166,0.3)',
              color: 'var(--accent)',
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse-slow"
              style={{ background: 'var(--accent)', boxShadow: '0 0 12px var(--accent)' }}
            />
            Promo akhir tahun — Hemat hingga 60%
          </span>
          <h1 className="font-extrabold mb-3" style={{ fontSize: 'clamp(32px, 5vw, 52px)', letterSpacing: '-1.5px' }}>
            Paket hosting untuk setiap skala
          </h1>
          <p className="text-lg max-w-[600px] mx-auto" style={{ color: 'var(--text-muted)' }}>
            Mulai dari blog personal hingga e-commerce skala enterprise.
          </p>
        </div>
      </section>

      <section className="pb-24 px-6">
        <div className="max-w-[1240px] mx-auto">
          <div className="flex justify-center mb-10">
            <div
              className="inline-flex p-1 gap-1 rounded-full"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              {(['shared', 'cloud', 'vps'] as PaketType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-5 py-2 rounded-full font-semibold text-sm cursor-pointer border-0 transition-all`}
                  style={
                    type === t
                      ? {
                          background: 'var(--gradient)',
                          color: 'white',
                          boxShadow: '0 4px 12px rgba(20,184,166,0.3)',
                        }
                      : { background: 'transparent', color: 'var(--text-muted)' }
                  }
                >
                  {t === 'shared' ? 'Shared' : t === 'cloud' ? 'Cloud' : 'VPS'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {paket.map((p) => (
              <div
                key={p.name}
                className="card relative transition-all hover:-translate-y-1"
                style={
                  'popular' in p && p.popular
                    ? {
                        borderColor: 'var(--accent)',
                        background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(20,184,166,0.05) 100%)',
                      }
                    : undefined
                }
              >
                {'popular' in p && p.popular && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full text-xs font-bold tracking-wider text-white"
                    style={{ background: 'var(--gradient)' }}
                  >
                    PALING DIPILIH
                  </span>
                )}
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--accent)' }}>
                  {p.name}
                </h3>
                <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
                  {p.desc}
                </p>
                <div className="text-sm line-through mb-1" style={{ color: 'var(--text-muted)' }}>
                  {fmtRp(p.oldPrice)}
                </div>
                <div className="flex items-baseline gap-1.5 mb-6">
                  <span className="font-extrabold" style={{ fontSize: 42, letterSpacing: '-1px' }}>
                    {fmtRp(p.price)}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    /bln
                  </span>
                </div>
                <ul className="my-6 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm py-1">
                      <span
                        className="rounded-full grid place-items-center text-[10px] font-bold flex-shrink-0"
                        style={{
                          background: 'rgba(20,184,166,0.15)',
                          color: 'var(--accent)',
                          width: 18,
                          height: 18,
                        }}
                      >
                        ✓
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/checkout?type=${type}&name=${encodeURIComponent(p.name)}&price=${p.price}`}
                  className={`btn ${'popular' in p && p.popular ? 'btn-primary' : 'btn-ghost'} btn-block`}
                >
                  Pilih Paket →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
