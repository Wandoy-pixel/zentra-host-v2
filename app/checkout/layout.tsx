import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Selesaikan pembelian dengan aman dan cepat.',
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
