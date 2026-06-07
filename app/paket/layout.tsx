import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Paket Hosting',
  description: 'Pilih paket hosting sesuai kebutuhan bisnis Anda.',
};

export default function PaketLayout({ children }: { children: React.ReactNode }) {
  return children;
}
