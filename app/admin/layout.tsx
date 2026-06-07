import AdminSidebar from '@/components/AdminSidebar';
import ThemeToggle from '@/components/ThemeToggle';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Panel — Zentra Host',
  description: 'Owner control panel Zentra Host.',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard');
  }

  const fullname = profile?.fullname || user.email?.split('@')[0] || 'Admin';

  return (
    <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] min-h-screen">
      <AdminSidebar />
      <main className="p-6 md:p-8 pb-20" style={{ background: 'var(--bg)' }}>
        <header
          className="card flex flex-wrap justify-between items-center mb-6 gap-4"
          style={{ padding: '20px 24px' }}
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-extrabold" style={{ letterSpacing: '-0.5px' }}>
                Admin Panel
              </h1>
              <span
                className="text-[10px] font-extrabold px-2 py-1 rounded-md text-white tracking-wider"
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                  boxShadow: '0 0 10px rgba(239,68,68,0.4)',
                }}
              >
                OWNER ACCESS
              </span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Kelola seluruh operasional Zentra Host.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div
              className="flex items-center gap-3 pl-2 pr-4 py-2 rounded-full"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div
                className="w-10 h-10 rounded-full grid place-items-center text-white font-bold"
                style={{ background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' }}
              >
                {fullname.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="text-xs font-semibold">{fullname}</h4>
                <small className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {user.email}
                </small>
              </div>
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
