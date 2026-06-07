import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ThemeProvider from '@/components/ThemeProvider';
import ToastProvider from '@/components/ToastProvider';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Zentra Host — Infrastruktur Web Generasi Baru',
    template: '%s | Zentra Host',
  },
  description:
    'Web hosting modern dengan NVMe SSD, LiteSpeed Enterprise, dan CDN global. Cepat, andal, dan tak terbatas.',
  keywords: ['web hosting', 'cloud hosting', 'vps', 'domain', 'indonesia'],
  authors: [{ name: 'Zentra Host' }],
  openGraph: {
    title: 'Zentra Host',
    description: 'Web hosting modern untuk bisnis Anda',
    type: 'website',
    locale: 'id_ID',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning className={inter.variable}>
      <body>
        <ThemeProvider>
          <div className="mesh-bg" />
          {children}
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
