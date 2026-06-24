import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LiveCounter from '@/components/LiveCounter';
import RecentPurchase from '@/components/RecentPurchase';
import { createClient } from '@/lib/supabase/server';
import { PAKET_DATA, fmtRp } from '@/lib/data';

export default async function HomePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <>
      <Navbar user={user} />
      <RecentPurchase />

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

          <div className="flex justify-center mb-6">
            <LiveCounter initialCount={234} />
          </div>

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

      {/* Trust Badges */}
      <section className="py-24 px-6">
        <div className="max-w-[1240px] mx-auto">
          <div className="text-center max-w-[700px] mx-auto mb-14">
            <span
              className="font-semibold text-xs tracking-[2px] uppercase"
              style={{ color: 'var(--accent)' }}
            >
              Kenapa Zentra Host
            </span>
            <h2 className="font-extrabold my-3" style={{ fontSize: 'clamp(28px, 4vw, 44px)', letterSpacing: '-1px' }}>
              Dipercaya ribuan pelanggan
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Komitmen kami untuk performa, keamanan, dan layanan terbaik.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { icon: '🛡️', title: '99.99% Uptime', desc: 'SLA Terjamin' },
              { icon: '💰', title: 'Garansi 30 Hari', desc: 'Refund 100%' },
              { icon: '🔒', title: 'SSL Gratis', desc: "Let's Encrypt" },
              { icon: '💬', title: 'Support 24/7', desc: 'Tim Engineer Lokal' },
            ].map((b) => (
              <div
                key={b.title}
                className="card text-center p-7 transition-all hover:-translate-y-1"
              >
                <div
                  className="w-14 h-14 rounded-2xl grid place-items-center mb-4 mx-auto text-2xl"
                  style={{ background: 'rgba(20,184,166,0.1)', color: 'var(--accent)' }}
                >
                  {b.icon}
                </div>
                <h3 className="text-base font-bold mb-1">{b.title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {b.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-[1240px] mx-auto">
          <div className="text-center max-w-[700px] mx-auto mb-14">
            <span
              className="font-semibold text-xs tracking-[2px] uppercase"
              style={{ color: 'var(--accent)' }}
            >
              Testimoni
            </span>
            <h2 className="font-extrabold my-3" style={{ fontSize: 'clamp(28px, 4vw, 44px)', letterSpacing: '-1px' }}>
              Kata mereka tentang Zentra Host
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Cerita nyata dari pelanggan setia kami.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                avatar: '👨‍💼',
                name: 'Budi Santoso',
                role: 'CEO TokoBudi.com',
                quote: 'Pindah dari hosting lama, traffic naik 3x lipat. CDN-nya beneran ngebut!',
              },
              {
                avatar: '👩‍💻',
                name: 'Sari Wijaya',
                role: 'Blogger',
                quote: 'Customer support responsif 24/7. Sekali chat langsung jawab!',
              },
              {
                avatar: '👨‍🔧',
                name: 'Rio Pratama',
                role: 'Developer',
                quote: 'Deploy cepat, panel-nya intuitif. Saya rekomen ke semua klien.',
              },
              {
                avatar: '👩‍🏫',
                name: 'Linda Hapsari',
                role: 'UKM Owner',
                quote: 'Harga terjangkau, fitur enterprise. Pilihan terbaik UKM Indonesia!',
              },
            ].map((t) => (
              <div
                key={t.name}
                className="card p-7 transition-all hover:-translate-y-1 flex flex-col"
              >
                <div className="flex gap-0.5 mb-4" style={{ color: '#fbbf24' }}>
                  {'★★★★★'.split('').map((s, i) => (
                    <span key={i} className="text-base">
                      {s}
                    </span>
                  ))}
                </div>
                <p
                  className="text-sm mb-6 flex-1 leading-relaxed"
                  style={{ color: 'var(--text-muted)' }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <div
                    className="w-11 h-11 rounded-full grid place-items-center text-2xl flex-shrink-0"
                    style={{ background: 'rgba(20,184,166,0.1)' }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-bold">{t.name}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {t.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6">
        <div className="max-w-[1240px] mx-auto">
          <div className="text-center max-w-[700px] mx-auto mb-14">
            <span
              className="font-semibold text-xs tracking-[2px] uppercase"
              style={{ color: 'var(--accent)' }}
            >
              FAQ
            </span>
            <h2 className="font-extrabold my-3" style={{ fontSize: 'clamp(28px, 4vw, 44px)', letterSpacing: '-1px' }}>
              Pertanyaan yang sering ditanyakan
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Belum menemukan jawabannya? Hubungi tim support kami.
            </p>
          </div>

          <div className="max-w-[820px] mx-auto space-y-4">
            {[
              {
                q: 'Apa itu web hosting?',
                a: 'Web hosting adalah layanan yang menyediakan ruang server agar website Anda bisa diakses melalui internet 24 jam non-stop. Sederhananya, hosting adalah "rumah" tempat file, database, dan email website Anda disimpan agar pengunjung dapat membukanya kapan saja.',
              },
              {
                q: 'Berapa lama proses aktivasi setelah pembayaran?',
                a: 'Aktivasi layanan dilakukan secara otomatis dalam waktu 1-5 menit setelah pembayaran berhasil dikonfirmasi sistem kami. Anda akan langsung menerima email berisi detail login cPanel dan informasi server.',
              },
              {
                q: 'Apakah ada garansi uang kembali?',
                a: 'Ya, kami memberikan garansi uang kembali 100% selama 30 hari pertama tanpa pertanyaan. Jika Anda merasa layanan kami tidak sesuai harapan, cukup hubungi tim support untuk proses refund yang cepat dan mudah.',
              },
              {
                q: 'Bisakah saya upgrade paket nanti?',
                a: 'Tentu saja. Anda bisa upgrade paket kapan saja langsung dari member area tanpa downtime. Sistem kami akan menghitung pro-rata biaya selisih, jadi Anda hanya membayar sisa periode aktif saja.',
              },
              {
                q: 'Metode pembayaran apa saja yang tersedia?',
                a: 'Kami menerima pembayaran via transfer bank (BCA, BNI, Mandiri, BRI), virtual account, e-wallet (GoPay, OVO, DANA, ShopeePay), QRIS, hingga kartu kredit. Semua pembayaran diproses secara aman melalui payment gateway tersertifikasi.',
              },
              {
                q: 'Apakah support 24/7 beneran?',
                a: 'Benar, tim support kami stand-by 24 jam sehari, 7 hari seminggu, termasuk hari libur nasional. Anda bisa menghubungi kami via live chat, tiket, WhatsApp, atau telepon. Rata-rata respon kami di bawah 5 menit.',
              },
            ].map((item) => (
              <details
                key={item.q}
                className="card group p-0 overflow-hidden"
              >
                <summary
                  className="cursor-pointer list-none p-6 flex items-center justify-between gap-4 font-semibold text-base hover:opacity-90"
                >
                  <span>{item.q}</span>
                  <span
                    className="w-8 h-8 rounded-full grid place-items-center flex-shrink-0 text-lg transition-transform group-open:rotate-45"
                    style={{ background: 'rgba(20,184,166,0.1)', color: 'var(--accent)' }}
                  >
                    +
                  </span>
                </summary>
                <div
                  className="px-6 pb-6 text-sm leading-relaxed"
                  style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}
                >
                  {item.a}
                </div>
              </details>
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
