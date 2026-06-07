import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';

export default async function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <Navbar user={user} />
      <main
        className="max-w-[800px] mx-auto px-6 py-16"
        style={{ color: 'var(--text)', lineHeight: 1.75 }}
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
