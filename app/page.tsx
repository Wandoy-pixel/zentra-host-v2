import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';
import { PAKET_DATA, fmtRp } from '@/lib/data';

export default async function HomePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <>
      <Navbar user={user} />

      {/* Hero */}
      <section className="py-20 px-6">
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
            Server baru di Jakarta sudah online
          </span>

          <h1
            className="font-extrabold mb-6 leading-[1.05]"
            style={{ fontSize: 'clamp(36px, 6vw, 64px)', letterSpacing: '-2px' }}
          >
            Infrastruktur web yang{' '}
            <span className="gradient-text">cepat, andal, dan tak terbatas.</span>
          </h1>

          <p className="text-lg max-w-[600px] mx-auto mb-10" style={{ color: 'var(--text-muted)' }}>
            Zentra Host menggabungkan NVMe SSD, LiteSpeed Enterprise, dan CDN
            global untuk performa terbaik website Anda.
          </p>

          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/paket" className="btn btn-primary btn-lg">
              Mulai Hosting →
            </Link>
            <a href="#fitur" className="btn btn-ghost btn-lg">
              Lihat Fitur
            </a>
          </div>

          {/* Stats */}
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-14 py-10"
            style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
          >
            {[
              { num: '99.99%', label: 'Uptime SLA' },
              { num: '<200ms', label: 'Response Time' },
              { num: '50K+', label: 'Website Aktif' },
              { num: '24/7', label: 'Support Pro' },
            ].map((s) => (
              <div key={s.label}>
                <div
                  className="font-extrabold gradient-text"
                  style={{ fontSize: 40, letterSpacing: '-1px' }}
                >
                  {s.num}
                </div>
                <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Bento */}
      <section id="fitur" className="py-24 px-6">
        <div className="max-w-[1240px] mx-auto">
          <div className="text-center max-w-[700px] mx-auto mb-14">
            <span
              className="font-semibold text-xs tracking-[2px] uppercase"
              style={{ color: 'var(--accent)' }}
            >
              Fitur Unggulan
            </span>
            <h2 className="font-extrabold my-3" style={{ fontSize: 'clamp(28px, 4vw, 44px)', letterSpacing: '-1px' }}>
              Semua yang Anda butuhkan untuk berkembang
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Stack hosting lengkap dengan teknologi terbaru.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              className="md:col-span-2 p-7 rounded-2xl"
              style={{
                background: 'var(--gradient)',
                color: 'white',
              }}
            >
              <div
                className="w-12 h-12 rounded-xl grid place-items-center mb-5 text-xl"
                style={{ background: 'rgba(255,255,255,0.2)' }}
              >
                ⚡
              </div>
              <h3 className="text-xl font-bold mb-2">NVMe SSD + LiteSpeed Enterprise</h3>
              <p className="text-sm opacity-90">
                Loading website hingga 9x lebih cepat dari Apache. Kombinasi
                storage NVMe terbaru dan web server LiteSpeed menghasilkan
                performa terbaik di kelasnya.
              </p>
            </div>

            {[
              { icon: '🛡️', title: 'SSL Gratis', desc: "Sertifikat Let's Encrypt otomatis." },
              { icon: '🌍', title: 'CDN Global', desc: '200+ edge location worldwide.' },
              { icon: '💾', title: 'Backup Otomatis', desc: 'Snapshot harian tersimpan 30 hari.' },
              { icon: '📧', title: 'Email Profesional', desc: 'Email unlimited domain sendiri.' },
              { icon: '🔧', title: 'cPanel', desc: 'Panel terlengkap & mudah.' },
              { icon: '💬', title: 'Support 24/7', desc: 'Tim teknis siap kapan saja.' },
            ].map((f) => (
              <div key={f.title} className="p-7 rounded-2xl card transition-all hover:-translate-y-1">
                <div
                  className="w-12 h-12 rounded-xl grid place-items-center mb-5 text-xl"
                  style={{ background: 'rgba(20,184,166,0.1)', color: 'var(--accent)' }}
                >
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6">
        <div className="max-w-[1240px] mx-auto">
          <div className="text-center max-w-[700px] mx-auto mb-14">
            <span
              className="font-semibold text-xs tracking-[2px] uppercase"
              style={{ color: 'var(--accent)' }}
            >
              Harga
            </span>
            <h2 className="font-extrabold my-3" style={{ fontSize: 'clamp(28px, 4vw, 44px)', letterSpacing: '-1px' }}>
              Transparan, tanpa biaya tersembunyi
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Pilih paket sesuai kebutuhan. Upgrade kapan saja.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PAKET_DATA.shared.slice(0, 3).map((p) => (
              <div
                key={p.name}
                className={`card relative transition-all hover:-translate-y-1`}
                style={
                  p.popular
                    ? {
                        borderColor: 'var(--accent)',
                        background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(20,184,166,0.05) 100%)',
                      }
                    : undefined
                }
              >
                {p.popular && (
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
                <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                  {p.desc}
                </p>
                <div className="text-sm line-through mb-1" style={{ color: 'var(--text-muted)' }}>
                  {fmtRp(p.oldPrice)}
                </div>
                <div className="flex items-baseline gap-1.5 mb-6">
                  <span
                    className="font-extrabold"
                    style={{ fontSize: 42, letterSpacing: '-1px' }}
                  >
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
                        className="w-4.5 h-4.5 rounded-full grid place-items-center text-[10px] font-bold flex-shrink-0"
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
                  href="/paket"
                  className={`btn ${p.popular ? 'btn-primary' : 'btn-ghost'} btn-block`}
                >
                  Pilih {p.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20">
        <div className="max-w-[1240px] mx-auto">
          <div
            className="rounded-3xl p-14 md:p-16 text-center relative overflow-hidden"
            style={{ background: 'var(--gradient)' }}
          >
            <h2 className="text-white font-extrabold text-3xl md:text-4xl mb-3">
              Siap memulai?
            </h2>
            <p className="mb-8 text-base text-white/90">
              Coba gratis 7 hari. Tidak perlu kartu kredit.
            </p>
            <Link href="/register" className="btn btn-lg bg-white text-[var(--bg)]">
              Daftar Sekarang →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
