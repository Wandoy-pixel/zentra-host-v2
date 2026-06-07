import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Daftar Domain',
  description: 'Cek ketersediaan dan daftar domain dengan harga terbaik.',
};

export default function DomainLayout({ children }: { children: React.ReactNode }) {
  return children;
}
