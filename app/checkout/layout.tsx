import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Selesaikan pembayaran untuk mengaktifkan layanan hosting Anda.',
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
