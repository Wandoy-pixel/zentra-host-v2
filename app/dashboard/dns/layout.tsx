import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DNS Manager',
  description: 'Kelola DNS record domain Anda.',
};

export default function DnsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
