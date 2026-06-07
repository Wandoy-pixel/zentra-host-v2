// Real domain availability check via DNS resolution
// Strategy: query NS records (and fallback to A records) — if resolution succeeds,
// the domain is registered. If ENOTFOUND/ENODATA/NXDOMAIN, the domain is likely available.
// On unexpected errors, fall back to a deterministic hash-based estimate so the UI
// always has something to show.

import dns from 'node:dns/promises';

export type DomainCheckResult = {
  available: boolean;
  source: 'dns' | 'fallback';
};

// Errors that indicate the domain is NOT registered / has no DNS records
const NOT_REGISTERED_CODES = new Set([
  'ENOTFOUND',
  'ENODATA',
  'NXDOMAIN',
  'SERVFAIL', // some TLDs return SERVFAIL for unregistered names
]);

function deterministicFallback(domain: string): boolean {
  // Same hash logic that was previously used client-side, so behavior is consistent
  // when the real DNS check fails for unexpected reasons.
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    hash = ((hash << 5) - hash + domain.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 3 !== 0;
}

export async function checkDomainAvailability(
  domain: string
): Promise<DomainCheckResult> {
  const clean = domain.trim().toLowerCase();
  if (!clean) {
    return { available: false, source: 'fallback' };
  }

  // 1) Try NS records first — every registered domain has authoritative nameservers.
  try {
    const ns = await dns.resolveNs(clean);
    if (ns && ns.length > 0) {
      return { available: false, source: 'dns' };
    }
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code && NOT_REGISTERED_CODES.has(code)) {
      // No NS — try A record as a secondary signal before declaring available.
      try {
        const a = await dns.resolve4(clean);
        if (a && a.length > 0) {
          return { available: false, source: 'dns' };
        }
      } catch (err2: unknown) {
        const code2 = (err2 as NodeJS.ErrnoException)?.code;
        if (code2 && NOT_REGISTERED_CODES.has(code2)) {
          return { available: true, source: 'dns' };
        }
        // Unexpected error on A lookup → fall through to hash fallback
        return {
          available: deterministicFallback(clean),
          source: 'fallback',
        };
      }
      // resolve4 returned no records and no error → treat as available
      return { available: true, source: 'dns' };
    }
    // Unexpected NS error (timeout, etc) → hash fallback
    return {
      available: deterministicFallback(clean),
      source: 'fallback',
    };
  }

  // resolveNs returned empty array without throwing
  return { available: true, source: 'dns' };
}
