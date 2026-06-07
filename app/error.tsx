'use client';

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
    <div className="min-h-screen grid place-items-center p-6">
      <div className="card max-w-md w-full text-center">
        <div className="text-5xl mb-3">⚠️</div>
        <h2 className="text-xl font-extrabold mb-2">Terjadi kesalahan</h2>
        <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
          {error.message || 'Sistem mengalami kendala. Silakan coba lagi.'}
        </p>
        <button onClick={() => reset()} className="btn btn-primary">
          Coba lagi
        </button>
      </div>
    </div>
  );
}
