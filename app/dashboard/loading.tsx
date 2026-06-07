export default function DashboardLoading() {
  return (
    <div className="space-y-4">
      <div
        className="card animate-pulse-slow"
        style={{ height: 80, background: 'var(--bg-card)' }}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="card animate-pulse-slow"
            style={{ height: 110 }}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
        <div className="card animate-pulse-slow" style={{ height: 320 }} />
        <div className="card animate-pulse-slow" style={{ height: 320 }} />
      </div>
    </div>
  );
}
