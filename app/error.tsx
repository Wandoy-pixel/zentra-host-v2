'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <div className="mesh-bg" aria-hidden="true" />
      <main className="min-h-screen grid place-items-center p-6">
        <div className="card max-w-md w-full text-center">
          <div
            className="mx-auto mb-4 w-16 h-16 rounded-full grid place-items-center text-3xl"
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'var(--danger)',
            }}
            aria-hidden="true"
          >
            !
          </div>
          <h2 className="text-2xl font-extrabold mb-2 gradient-text">
            Terjadi kesalahan
          </h2>
          <p
            className="text-sm mb-6"
            style={{ color: 'var(--text-muted)' }}
          >
            Maaf, sistem mengalami kendala saat memproses permintaan kamu.
            Silakan coba beberapa saat lagi.
          </p>
          {error?.digest && (
            <p
              className="text-xs mb-5 font-mono"
              style={{ color: 'var(--text-muted)', opacity: 0.7 }}
            >
              Ref: {error.digest}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => reset()}
              className="btn btn-primary"
            >
              Coba Lagi
            </button>
            <Link href="/" className="btn btn-ghost">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
