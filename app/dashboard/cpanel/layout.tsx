import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'cPanel Control Panel',
  description: 'Kelola subdomain, email, dan database MySQL.',
};

export default function CpanelLayout({ children }: { children: React.ReactNode }) {
  return children;
}
