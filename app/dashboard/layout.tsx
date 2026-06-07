import DashboardSidebar from '@/components/DashboardSidebar';
import Greeting from '@/components/Greeting';
import ThemeToggle from '@/components/ThemeToggle';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const fullname = profile?.fullname || user.email?.split('@')[0] || 'User';

  return (
    <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] min-h-screen">
      <DashboardSidebar />
      <main className="p-6 md:p-8 pb-20" style={{ background: 'var(--bg)' }}>
        <header
          className="card flex flex-wrap justify-between items-center mb-6 gap-4"
          style={{ padding: '20px 24px' }}
        >
          <div>
            <h1 className="text-2xl font-extrabold" style={{ letterSpacing: '-0.5px' }}>
              <Greeting name={fullname.split(' ')[0]} />
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Kelola layanan hosting kamu di sini.
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
                style={{ background: 'var(--gradient)' }}
              >
                {fullname.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="text-xs font-semibold">{fullname}</h4>
                <small className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{user.email}</small>
              </div>
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
