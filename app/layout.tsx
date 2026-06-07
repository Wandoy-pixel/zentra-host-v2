import type { Metadata } from 'next';
import './globals.css';
import ThemeProvider from '@/components/ThemeProvider';
import ToastProvider from '@/components/ToastProvider';

export const metadata: Metadata = {
  title: 'Zentra Host — Infrastruktur Web Generasi Baru',
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
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
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
