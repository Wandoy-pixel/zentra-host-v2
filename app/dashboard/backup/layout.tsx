import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Backup Manager',
  description: 'Kelola backup hosting Anda.',
};

export default function BackupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
