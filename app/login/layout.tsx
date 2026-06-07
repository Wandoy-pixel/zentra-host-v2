import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Masuk ke akun Zentra Host Anda.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
