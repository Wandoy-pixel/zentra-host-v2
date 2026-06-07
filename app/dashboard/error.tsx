'use client';

import { useEffect } from 'react';

export default function DashboardError({
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
    <div className="card text-center py-10">
      <div className="text-5xl mb-3">⚠️</div>
      <h2 className="text-lg font-bold mb-2">Gagal memuat dashboard</h2>
      <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
        {error.message || 'Terjadi kesalahan saat memuat data.'}
      </p>
      <button onClick={() => reset()} className="btn btn-primary">
        Coba lagi
      </button>
    </div>
  );
}
