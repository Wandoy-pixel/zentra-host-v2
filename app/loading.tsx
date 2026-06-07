export default function Loading() {
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-10 h-10 rounded-full animate-pulse-slow"
          style={{
            background: 'var(--gradient)',
            boxShadow: '0 0 24px var(--accent)',
          }}
        />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Memuat...
        </p>
      </div>
    </div>
  );
}
