export default function Loading() {
  return (
    <>
      <div className="mesh-bg" aria-hidden="true" />
      <main className="min-h-screen grid place-items-center p-6">
        <div className="flex flex-col items-center gap-5">
          <div
            className="w-14 h-14 rounded-full animate-spin"
            style={{
              border: '4px solid var(--surface-soft-strong)',
              borderTopColor: 'var(--accent)',
              borderRightColor: 'var(--secondary)',
            }}
            role="status"
            aria-label="Memuat"
          />
          <p
            className="text-sm font-medium"
            style={{ color: 'var(--text-muted)' }}
          >
            Memuat...
          </p>
        </div>
      </main>
    </>
  );
}
