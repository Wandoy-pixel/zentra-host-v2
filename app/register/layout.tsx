import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Daftar Akun',
  description: 'Daftar akun Zentra Host gratis dan mulai hosting hari ini.',
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
