import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '60px 0 30px' }}>
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-10">
          <div>
            <Link href="/" className="flex items-center gap-2.5 font-extrabold text-xl mb-4">
              <span
                className="w-8 h-8 rounded-lg grid place-items-center text-white"
                style={{ background: 'var(--gradient)' }}
              >
                Z
              </span>
              <span>Zentra</span>
            </Link>
            <p className="text-sm max-w-[300px]" style={{ color: 'var(--text-muted)' }}>
              Infrastruktur web generasi baru untuk Indonesia. Cepat, aman, dan
              didukung tim engineer lokal.
            </p>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
              Produk
            </h4>
            <ul className="space-y-2.5">
              <li><Link href="/paket" className="text-sm hover:text-[var(--accent)] transition-colors">Shared Hosting</Link></li>
              <li><Link href="/paket" className="text-sm hover:text-[var(--accent)] transition-colors">Cloud Hosting</Link></li>
              <li><Link href="/paket" className="text-sm hover:text-[var(--accent)] transition-colors">VPS Server</Link></li>
              <li><Link href="/domain" className="text-sm hover:text-[var(--accent)] transition-colors">Domain</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
              Perusahaan
            </h4>
            <ul className="space-y-2.5">
              <li><span className="text-sm">Tentang</span></li>
              <li><span className="text-sm">Blog</span></li>
              <li><span className="text-sm">Karier</span></li>
              <li><Link href="/kontak" className="text-sm hover:text-[var(--accent)] transition-colors">Kontak</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
              Bantuan
            </h4>
            <ul className="space-y-2.5">
              <li><span className="text-sm">Dokumentasi</span></li>
              <li><span className="text-sm">Status Server</span></li>
              <li><span className="text-sm">Pusat Bantuan</span></li>
              <li><span className="text-sm">API</span></li>
            </ul>
          </div>
        </div>

        <div
          className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm"
          style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}
        >
          <p>© 2026 Zentra Host. Built in Indonesia 🇮🇩</p>
          <div className="flex gap-2.5">
            {['𝕏', 'in', 'ig', 'gh'].map((s) => (
              <span
                key={s}
                className="w-9 h-9 grid place-items-center cursor-pointer rounded-lg transition-all"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
