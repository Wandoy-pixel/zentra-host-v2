import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cek & Daftar Domain',
  description: 'Cek ketersediaan domain dan daftarkan domain Anda dengan harga terjangkau.',
};

export default function DomainLayout({ children }: { children: React.ReactNode }) {
  return children;
}
