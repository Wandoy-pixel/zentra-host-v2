import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="card max-w-md w-full text-center">
        <div className="text-5xl mb-3">🔍</div>
        <h2 className="text-2xl font-extrabold mb-2">404 — Halaman tidak ditemukan</h2>
        <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
          Halaman yang Anda cari tidak tersedia atau sudah dipindahkan.
        </p>
        <Link href="/" className="btn btn-primary">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
