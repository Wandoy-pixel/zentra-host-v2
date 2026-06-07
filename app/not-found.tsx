import Link from 'next/link';

export default function NotFound() {
  return (
    <>
      <div className="mesh-bg" aria-hidden="true" />
      <main className="min-h-screen grid place-items-center p-6">
        <div className="max-w-xl w-full text-center">
          <h1 className="gradient-text font-extrabold leading-none tracking-tight text-[120px] sm:text-[160px] md:text-[200px]">
            404
          </h1>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-2 mb-3">
            Halaman tidak ditemukan
          </h2>
          <p
            className="text-sm sm:text-base mb-8 max-w-md mx-auto"
            style={{ color: 'var(--text-muted)' }}
          >
            Maaf, halaman yang kamu cari mungkin sudah dipindahkan atau tidak ada.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="btn btn-primary btn-lg">
              Kembali ke Beranda
            </Link>
            <Link href="/kontak" className="btn btn-ghost btn-lg">
              Hubungi Support
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
