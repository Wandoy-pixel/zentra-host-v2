import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Pusat Bantuan',
  description: 'Tutorial, panduan, dan FAQ Zentra Host.',
};

export const dynamic = 'force-dynamic';

type Article = {
  id?: number | string;
  slug: string;
  title: string;
  category: string;
  content?: string;
  views_count?: number;
};

const CATEGORY_META: Record<
  string,
  { label: string; icon: string; desc: string; color: string; bg: string }
> = {
  'getting-started': {
    label: 'Getting Started',
    icon: '🚀',
    desc: 'Mulai dengan Zentra Host dalam hitungan menit.',
    color: 'var(--accent)',
    bg: 'rgba(20,184,166,0.12)',
  },
  billing: {
    label: 'Billing',
    icon: '💳',
    desc: 'Pembayaran, invoice, dan refund.',
    color: 'var(--warning)',
    bg: 'rgba(245,158,11,0.12)',
  },
  hosting: {
    label: 'Hosting',
    icon: '🖥️',
    desc: 'cPanel, FTP, database, dan WordPress.',
    color: 'var(--secondary)',
    bg: 'rgba(99,102,241,0.12)',
  },
  domain: {
    label: 'Domain',
    icon: '🌐',
    desc: 'DNS, transfer, dan manajemen domain.',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.12)',
  },
  security: {
    label: 'Security',
    icon: '🔒',
    desc: 'SSL, 2FA, dan keamanan akun.',
    color: 'var(--danger)',
    bg: 'rgba(239,68,68,0.12)',
  },
};

const FALLBACK_ARTICLES: Article[] = [
  // Getting Started
  { slug: 'cara-daftar-akun', title: 'Cara Daftar Akun', category: 'getting-started' },
  { slug: 'memilih-paket-hosting-tepat', title: 'Memilih Paket Hosting Tepat', category: 'getting-started' },
  // Hosting
  { slug: 'setup-wordpress-cpanel', title: 'Setup WordPress di cPanel', category: 'hosting' },
  { slug: 'mengelola-file-via-ftp', title: 'Mengelola File via FTP', category: 'hosting' },
  // Billing
  { slug: 'cara-bayar-via-midtrans', title: 'Cara Bayar via Midtrans', category: 'billing' },
  { slug: 'refund-policy', title: 'Refund Policy', category: 'billing' },
  // Domain
  { slug: 'cara-setup-dns', title: 'Cara Setup DNS', category: 'domain' },
  { slug: 'transfer-domain-masuk', title: 'Transfer Domain Masuk', category: 'domain' },
  // Security
  { slug: 'setup-ssl-gratis', title: 'Setup SSL Gratis', category: 'security' },
  { slug: 'aktifkan-2fa', title: 'Aktifkan 2FA', category: 'security' },
];

export default async function HelpPage() {
  const supabase = createClient();

  const { data: dbArticles } = await supabase
    .from('knowledge_base')
    .select('id, slug, title, category, views_count')
    .eq('published', true)
    .order('views_count', { ascending: false });

  const articles: Article[] =
    dbArticles && dbArticles.length > 0
      ? (dbArticles as Article[])
      : FALLBACK_ARTICLES;

  // Group by category
  const grouped: Record<string, Article[]> = {};
  for (const a of articles) {
    if (!grouped[a.category]) grouped[a.category] = [];
    grouped[a.category].push(a);
  }

  // Featured: top 4 by views (or first 4 fallback)
  const featured = articles.slice(0, 4);

  return (
    <>
      {/* Header */}
      <section className="mb-10 text-center">
        <h1
          className="font-extrabold mb-3"
          style={{ fontSize: 'clamp(28px, 4vw, 44px)', letterSpacing: '-1.2px' }}
        >
          Pusat <span className="gradient-text">Bantuan</span>
        </h1>
        <p className="text-base mb-7" style={{ color: 'var(--text-muted)' }}>
          Tutorial, panduan, dan FAQ Zentra Host.
        </p>

        {/* Search bar (UI only) */}
        <form className="max-w-[560px] mx-auto" action="/help" method="get">
          <div
            className="flex items-center gap-2 rounded-full px-4 py-2 transition-all focus-within:border-[var(--accent)]"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <span className="text-base" style={{ color: 'var(--text-muted)' }}>
              🔍
            </span>
            <input
              type="text"
              name="q"
              placeholder="Cari artikel, panduan, FAQ..."
              className="flex-1 bg-transparent border-0 outline-none text-sm py-2"
              style={{ color: 'var(--text)' }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '8px 18px', fontSize: 13 }}
            >
              Cari
            </button>
          </div>
        </form>
      </section>

      {/* Featured Articles */}
      {featured.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-lg">⭐</span>
            <h2 className="text-xl font-bold">Artikel Populer</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featured.map((a) => {
              const meta = CATEGORY_META[a.category];
              return (
                <Link
                  key={a.slug}
                  href={`/help/${a.slug}`}
                  className="card transition-all hover:-translate-y-1"
                  style={{ display: 'block' }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl grid place-items-center text-xl flex-shrink-0"
                      style={{ background: meta?.bg || 'var(--surface-soft)' }}
                    >
                      {meta?.icon || '📄'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span
                        className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider mb-2"
                        style={{
                          background: meta?.bg || 'var(--surface-soft)',
                          color: meta?.color || 'var(--text-muted)',
                        }}
                      >
                        {meta?.label || a.category}
                      </span>
                      <h3 className="font-semibold text-base mb-1.5 leading-snug">
                        {a.title}
                      </h3>
                      {typeof a.views_count === 'number' && a.views_count > 0 && (
                        <p
                          className="text-xs flex items-center gap-1.5"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <span>👁️</span>
                          <span>{a.views_count.toLocaleString('id-ID')} views</span>
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Category Cards */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <span className="text-lg">📂</span>
          <h2 className="text-xl font-bold">Jelajahi Kategori</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.keys(CATEGORY_META).map((catKey) => {
            const meta = CATEGORY_META[catKey];
            const list = grouped[catKey] || [];
            return (
              <div
                key={catKey}
                id={catKey}
                className="card"
                style={{ scrollMarginTop: 100 }}
              >
                <div className="flex items-start gap-3.5 mb-4">
                  <div
                    className="w-11 h-11 rounded-xl grid place-items-center text-xl flex-shrink-0"
                    style={{ background: meta.bg }}
                  >
                    {meta.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base mb-0.5">{meta.label}</h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {meta.desc}
                    </p>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{ background: meta.bg, color: meta.color }}
                  >
                    {list.length}
                  </span>
                </div>

                {list.length === 0 ? (
                  <p
                    className="text-sm italic py-3 text-center"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Belum ada artikel.
                  </p>
                ) : (
                  <ul
                    className="flex flex-col"
                    style={{ borderTop: '1px solid var(--border)' }}
                  >
                    {list.slice(0, 5).map((a) => (
                      <li key={a.slug}>
                        <Link
                          href={`/help/${a.slug}`}
                          className="flex items-center justify-between py-2.5 text-sm transition-colors hover:text-[var(--accent)]"
                          style={{
                            color: 'var(--text)',
                            borderBottom: '1px solid var(--border)',
                          }}
                        >
                          <span className="flex items-center gap-2">
                            <span style={{ color: 'var(--text-muted)' }}>→</span>
                            <span>{a.title}</span>
                          </span>
                          <span style={{ color: 'var(--text-muted)' }}>›</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="mt-12">
        <div
          className="rounded-2xl p-8 text-center text-white"
          style={{ background: 'var(--gradient)' }}
        >
          <h3 className="text-xl font-bold mb-2">Masih butuh bantuan?</h3>
          <p className="text-sm opacity-90 mb-5">
            Tim support kami siap membantu 24/7. Kirim tiket atau hubungi kami langsung.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/dashboard/tickets/new"
              className="btn"
              style={{ background: 'white', color: 'var(--accent)' }}
            >
              Buat Tiket
            </Link>
            <Link
              href="/kontak"
              className="btn"
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
              }}
            >
              Hubungi Kami
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
