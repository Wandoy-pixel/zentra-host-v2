import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Daftar',
  description: 'Buat akun Zentra Host gratis.',
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
