import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Pusat Bantuan',
  description: 'Tutorial, panduan, dan FAQ Zentra Host.',
};

const CATEGORIES = [
  { slug: 'getting-started', label: 'Getting Started', icon: '🚀' },
  { slug: 'billing', label: 'Billing', icon: '💳' },
  { slug: 'hosting', label: 'Hosting', icon: '🖥️' },
  { slug: 'domain', label: 'Domain', icon: '🌐' },
  { slug: 'security', label: 'Security', icon: '🔒' },
];

export default async function HelpLayout({
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

      <main className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="md:sticky md:top-24 md:self-start">
            <div
              className="rounded-2xl p-5"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div
                className="text-[11px] font-bold uppercase tracking-wider mb-4"
                style={{ color: 'var(--text-muted)' }}
              >
                Kategori
              </div>
              <nav className="flex flex-col gap-1">
                <Link
                  href="/help"
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={{ color: 'var(--text)' }}
                >
                  <span>📚</span>
                  <span>Semua Artikel</span>
                </Link>
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/help#${cat.slug}`}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--surface-soft)]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </Link>
                ))}
              </nav>

              <div
                className="mt-6 pt-5 text-xs"
                style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}
              >
                <p className="mb-3">Tidak menemukan jawaban?</p>
                <Link
                  href="/kontak"
                  className="btn btn-primary btn-block"
                  style={{ fontSize: 13 }}
                >
                  Hubungi Support →
                </Link>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div>{children}</div>
        </div>
      </main>

      <Footer />
    </>
  );
}
