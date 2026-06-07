import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kontak',
  description: 'Hubungi tim support Zentra Host - tersedia 24/7.',
};

export default function KontakLayout({ children }: { children: React.ReactNode }) {
  return children;
}
