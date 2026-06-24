import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type Article = {
  id: number;
  slug: string;
  title: string;
  category: string;
  content: string;
  views_count: number;
  created_at: string;
};

const CATEGORY_META: Record<
  string,
  { label: string; icon: string; color: string; bg: string }
> = {
  'getting-started': {
    label: 'Getting Started',
    icon: '🚀',
    color: 'var(--accent)',
    bg: 'rgba(20,184,166,0.12)',
  },
  billing: {
    label: 'Billing',
    icon: '💳',
    color: 'var(--warning)',
    bg: 'rgba(245,158,11,0.12)',
  },
  hosting: {
    label: 'Hosting',
    icon: '🖥️',
    color: 'var(--secondary)',
    bg: 'rgba(99,102,241,0.12)',
  },
  domain: {
    label: 'Domain',
    icon: '🌐',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.12)',
  },
  security: {
    label: 'Security',
    icon: '🔒',
    color: 'var(--danger)',
    bg: 'rgba(239,68,68,0.12)',
  },
};

// Fallback articles (when DB belum punya data) — copied from index for consistency
const FALLBACK_ARTICLES: Record<string, { title: string; category: string; content: string }> = {
  'cara-daftar-akun': {
    title: 'Cara Daftar Akun',
    category: 'getting-started',
    content: `Mendaftar akun di Zentra Host sangat mudah dan hanya butuh beberapa menit.

1. Klik tombol "Mulai Gratis" di pojok kanan atas halaman utama.
2. Isi formulir registrasi dengan nama, email aktif, dan password yang kuat.
3. Cek email Anda untuk verifikasi (opsional — akun langsung aktif).
4. Login dan mulai jelajahi dashboard Anda.

Setelah login, Anda bisa langsung memilih paket hosting, mendaftarkan domain, atau mengaktifkan layanan lain dari dashboard.`,
  },
  'memilih-paket-hosting-tepat': {
    title: 'Memilih Paket Hosting Tepat',
    category: 'getting-started',
    content: `Memilih paket hosting yang tepat tergantung pada kebutuhan website Anda.

Shared Hosting — Cocok untuk blog personal, landing page, atau website kecil dengan traffic <10rb/bulan.
Cloud Hosting — Ideal untuk bisnis menengah, e-commerce ringan, dan website dengan traffic medium.
VPS Hosting — Untuk developer, aplikasi custom, atau website dengan traffic tinggi yang butuh kontrol penuh.

Tips: Mulai dari paket terkecil yang sesuai. Anda selalu bisa upgrade kapan saja tanpa downtime.`,
  },
  'setup-wordpress-cpanel': {
    title: 'Setup WordPress di cPanel',
    category: 'hosting',
    content: `Install WordPress di cPanel hanya butuh 5 menit dengan auto-installer.

1. Login ke cPanel dari dashboard Zentra.
2. Cari "Softaculous Apps Installer" atau "WordPress Installer".
3. Klik "Install Now", pilih domain dan direktori.
4. Isi nama situs, username admin, password, dan email.
5. Klik "Install" — WordPress akan terpasang otomatis.

Setelah selesai, Anda bisa login ke /wp-admin menggunakan kredensial yang dibuat.`,
  },
  'mengelola-file-via-ftp': {
    title: 'Mengelola File via FTP',
    category: 'hosting',
    content: `FTP (File Transfer Protocol) memudahkan upload dan manajemen file di hosting.

Akun FTP otomatis dibuat saat hosting aktif. Detail login bisa Anda lihat di dashboard atau cPanel > FTP Accounts.

Rekomendasi FTP Client:
- FileZilla (gratis, multi-platform)
- WinSCP (Windows)
- Cyberduck (Mac)

Login menggunakan:
- Host: ftp.yourdomain.com
- Username: dari cPanel
- Password: yang Anda set
- Port: 21 (FTP) atau 22 (SFTP)`,
  },
  'cara-bayar-via-midtrans': {
    title: 'Cara Bayar via Midtrans',
    category: 'billing',
    content: `Zentra menggunakan Midtrans sebagai payment gateway untuk berbagai metode pembayaran.

Metode yang tersedia:
- Transfer Bank: BCA, Mandiri, BNI, BRI, Permata
- E-Wallet: GoPay, OVO, DANA, ShopeePay
- QRIS (semua bank/e-wallet pendukung QRIS)
- Kartu Kredit (Visa, Mastercard, JCB)

Cara bayar:
1. Pilih paket dan klik "Checkout".
2. Pilih metode pembayaran di halaman Midtrans.
3. Ikuti instruksi pembayaran sesuai metode.
4. Layanan otomatis aktif setelah pembayaran terkonfirmasi (biasanya <60 detik).`,
  },
  'refund-policy': {
    title: 'Refund Policy',
    category: 'billing',
    content: `Zentra Host memberikan garansi uang kembali 30 hari untuk semua paket shared hosting.

Syarat refund:
- Pengajuan dalam 30 hari setelah pembayaran pertama.
- Hanya berlaku untuk paket shared hosting (tidak berlaku untuk domain, SSL berbayar, dan VPS).
- Refund diproses 3-7 hari kerja ke rekening/e-wallet sumber.

Cara mengajukan refund:
1. Buat tiket support kategori "Billing".
2. Sertakan order ID dan alasan refund.
3. Tim kami akan memproses dalam 1x24 jam.`,
  },
  'cara-setup-dns': {
    title: 'Cara Setup DNS',
    category: 'domain',
    content: `Setup DNS untuk mengarahkan domain Anda ke hosting Zentra.

Jika domain didaftarkan di Zentra:
DNS otomatis diatur saat aktivasi hosting. Tidak perlu konfigurasi manual.

Jika domain dari provider lain:
1. Login ke panel domain (Niagahoster, Domainesia, GoDaddy, dll).
2. Cari menu "Nameserver" atau "DNS Management".
3. Set nameserver ke:
   - ns1.zentra.id
   - ns2.zentra.id
4. Tunggu propagasi DNS (1-48 jam, biasanya <1 jam).

Cek status propagasi di whatsmydns.net.`,
  },
  'transfer-domain-masuk': {
    title: 'Transfer Domain Masuk',
    category: 'domain',
    content: `Pindahkan domain Anda ke Zentra untuk manajemen yang lebih mudah.

Persiapan transfer:
1. Unlock domain di registrar lama.
2. Minta kode EPP/Authorization Code dari registrar lama.
3. Pastikan domain berusia minimal 60 hari sejak registrasi/transfer terakhir.

Proses transfer:
1. Buka halaman /domain di Zentra dan pilih "Transfer Domain".
2. Masukkan nama domain dan kode EPP.
3. Bayar biaya transfer (umumnya = perpanjangan 1 tahun).
4. Konfirmasi email dari registrar lama.
5. Tunggu 5-7 hari kerja untuk proses selesai.`,
  },
  'setup-ssl-gratis': {
    title: 'Setup SSL Gratis',
    category: 'security',
    content: `Semua paket hosting Zentra sudah include SSL gratis Let's Encrypt yang otomatis terpasang.

Cara aktivasi:
1. Domain harus mengarah ke server Zentra (DNS aktif).
2. Buka cPanel > SSL/TLS Status.
3. Klik "Run AutoSSL" — sertifikat akan dipasang dalam beberapa menit.
4. Verifikasi: buka https://yourdomain.com — harus muncul ikon gembok.

SSL akan otomatis diperpanjang setiap 90 hari. Anda tidak perlu melakukan apapun.

Force HTTPS:
Tambahkan di .htaccess root:
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]`,
  },
  'aktifkan-2fa': {
    title: 'Aktifkan 2FA',
    category: 'security',
    content: `Two-Factor Authentication (2FA) menambahkan lapisan keamanan ekstra untuk akun Anda.

Cara aktivasi 2FA:
1. Login ke dashboard Zentra.
2. Buka Settings > Security.
3. Klik "Enable 2FA".
4. Scan QR code dengan aplikasi authenticator (Google Authenticator, Authy, atau 1Password).
5. Masukkan 6-digit kode dari aplikasi untuk konfirmasi.
6. Simpan recovery codes di tempat aman — gunakan jika kehilangan akses ke authenticator.

Setelah aktif, setiap login akan butuh kode 6-digit dari aplikasi authenticator selain password.

Tips: Jangan simpan recovery code di tempat yang sama dengan password.`,
  },
};

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient();
  const { data } = await supabase
    .from('knowledge_base')
    .select('title, content')
    .eq('slug', params.slug)
    .eq('published', true)
    .maybeSingle();

  if (data) {
    return {
      title: data.title,
      description: (data.content as string).slice(0, 160).replace(/\n/g, ' '),
    };
  }

  const fb = FALLBACK_ARTICLES[params.slug];
  if (fb) {
    return {
      title: fb.title,
      description: fb.content.slice(0, 160).replace(/\n/g, ' '),
    };
  }

  return { title: 'Artikel tidak ditemukan' };
}

export default async function ArticlePage({ params }: Props) {
  const supabase = createClient();

  const { data: dbArticle } = await supabase
    .from('knowledge_base')
    .select('id, slug, title, category, content, views_count, created_at')
    .eq('slug', params.slug)
    .eq('published', true)
    .maybeSingle();

  let article: Article | null = null;
  let isFromDb = false;

  if (dbArticle) {
    article = dbArticle as Article;
    isFromDb = true;
  } else {
    const fb = FALLBACK_ARTICLES[params.slug];
    if (fb) {
      article = {
        id: 0,
        slug: params.slug,
        title: fb.title,
        category: fb.category,
        content: fb.content,
        views_count: 0,
        created_at: new Date().toISOString(),
      };
    }
  }

  if (!article) notFound();

  // Increment views_count (best-effort, only for DB articles)
  if (isFromDb) {
    await supabase
      .from('knowledge_base')
      .update({ views_count: (article.views_count || 0) + 1 })
      .eq('id', article.id);
  }

  // Related articles (same category)
  let relatedArticles: { slug: string; title: string }[] = [];
  if (isFromDb) {
    const { data: rel } = await supabase
      .from('knowledge_base')
      .select('slug, title')
      .eq('category', article.category)
      .eq('published', true)
      .neq('slug', article.slug)
      .limit(5);
    relatedArticles = (rel as { slug: string; title: string }[]) || [];
  } else {
    relatedArticles = Object.entries(FALLBACK_ARTICLES)
      .filter(([slug, a]) => a.category === article!.category && slug !== article!.slug)
      .slice(0, 5)
      .map(([slug, a]) => ({ slug, title: a.title }));
  }

  const meta = CATEGORY_META[article.category] || {
    label: article.category,
    icon: '📄',
    color: 'var(--text-muted)',
    bg: 'var(--surface-soft)',
  };

  return (
    <>
      {/* Breadcrumb */}
      <nav
        className="flex items-center gap-2 text-xs mb-6 flex-wrap"
        style={{ color: 'var(--text-muted)' }}
      >
        <Link href="/help" className="hover:text-[var(--accent)] transition-colors">
          Help
        </Link>
        <span>›</span>
        <Link
          href={`/help#${article.category}`}
          className="hover:text-[var(--accent)] transition-colors"
        >
          {meta.label}
        </Link>
        <span>›</span>
        <span style={{ color: 'var(--text)' }}>{article.title}</span>
      </nav>

      {/* Article Header */}
      <article className="card mb-8">
        <div className="flex items-center gap-3 mb-5">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: meta.bg, color: meta.color }}
          >
            <span>{meta.icon}</span>
            <span>{meta.label}</span>
          </span>
          {isFromDb && article.views_count > 0 && (
            <span
              className="inline-flex items-center gap-1 text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              <span>👁️</span>
              <span>{article.views_count.toLocaleString('id-ID')} views</span>
            </span>
          )}
        </div>

        <h1
          className="font-extrabold mb-6"
          style={{ fontSize: 'clamp(24px, 3.2vw, 36px)', letterSpacing: '-0.8px', lineHeight: 1.25 }}
        >
          <span className="gradient-text">{article.title}</span>
        </h1>

        {/* Content: render as HTML if contains tags, else preserve whitespace */}
        {/<[a-z][\s\S]*>/i.test(article.content) ? (
          <div
            className="article-content"
            style={{
              color: 'var(--text)',
              lineHeight: 1.75,
              fontSize: 15,
            }}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        ) : (
          <div
            className="whitespace-pre-wrap"
            style={{
              color: 'var(--text)',
              lineHeight: 1.8,
              fontSize: 15,
            }}
          >
            {article.content}
          </div>
        )}
      </article>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base">📎</span>
            <h2 className="text-lg font-bold">Artikel Terkait</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relatedArticles.map((r) => (
              <Link
                key={r.slug}
                href={`/help/${r.slug}`}
                className="flex items-center justify-between gap-3 p-4 rounded-xl transition-all hover:-translate-y-0.5"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              >
                <span className="flex items-center gap-2.5 text-sm font-medium">
                  <span style={{ color: meta.color }}>›</span>
                  <span>{r.title}</span>
                </span>
                <span style={{ color: 'var(--text-muted)' }}>→</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section>
        <div
          className="rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div>
            <h3 className="font-bold text-base mb-1">Artikel ini membantu?</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Hubungi tim support kami jika butuh bantuan lebih lanjut.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link href="/dashboard/tickets/new" className="btn btn-primary">
              Buat Tiket
            </Link>
            <Link href="/help" className="btn btn-ghost">
              Kembali ke Help
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
