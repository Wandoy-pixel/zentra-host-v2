'use server';

import { checkDomainAvailability } from '@/lib/domain-check';
import { DOMAIN_PRICES } from '@/lib/data';

export type SearchDomainResult = {
  available: boolean;
  price: number;
  full: string;
  source: 'dns' | 'fallback';
  error?: string;
};

export async function searchDomain(
  name: string,
  ext: string
): Promise<SearchDomainResult> {
  const clean = (name || '').toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
  const safeExt = (ext || '').trim();
  const full = clean + safeExt;
  const price = DOMAIN_PRICES.find((d) => d.ext === safeExt)?.price || 100000;

  if (clean.length < 2) {
    return {
      available: false,
      price,
      full,
      source: 'fallback',
      error: 'Nama domain terlalu pendek',
    };
  }

  try {
    const { available, source } = await checkDomainAvailability(full);
    return { available, price, full, source };
  } catch {
    return {
      available: false,
      price,
      full,
      source: 'fallback',
      error: 'Gagal mengecek domain, coba lagi',
    };
  }
}
