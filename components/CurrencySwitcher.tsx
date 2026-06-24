'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Currency = 'IDR' | 'USD';

type CurrencyContextType = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  format: (amount: number) => string;
};

// Exchange rate hardcoded untuk iterasi awal (visual only)
const USD_TO_IDR = 15500;

const formatIDR = (amount: number) => {
  // amount selalu dalam IDR sebagai basis
  return `Rp ${Math.round(amount).toLocaleString('id-ID')}`;
};

const formatUSD = (amount: number) => {
  const usd = amount / USD_TO_IDR;
  return `$${usd.toFixed(2)}`;
};

const defaultFormat = (amount: number) => formatIDR(amount);

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'IDR',
  setCurrency: () => {},
  format: defaultFormat,
});

export const useCurrency = () => useContext(CurrencyContext);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('IDR');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('preferred_currency') as Currency | null;
      if (saved === 'IDR' || saved === 'USD') {
        setCurrencyState(saved);
      }
    } catch {}
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem('preferred_currency', c);
    } catch {}
  };

  const format = (amount: number) => {
    if (currency === 'USD') return formatUSD(amount);
    return formatIDR(amount);
  };

  if (!mounted) {
    return (
      <CurrencyContext.Provider value={{ currency: 'IDR', setCurrency, format: defaultFormat }}>
        {children}
      </CurrencyContext.Provider>
    );
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export default function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();

  const baseBtn: React.CSSProperties = {
    height: 30,
    padding: '0 10px',
    fontSize: 12,
    fontWeight: 700,
    fontFamily: 'inherit',
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    borderRadius: 8,
    transition: 'all 0.2s ease',
  };

  const activeBtn: React.CSSProperties = {
    ...baseBtn,
    background: 'var(--surface-soft)',
    color: 'var(--text)',
  };

  return (
    <div
      title="Ubah mata uang"
      className="inline-flex items-center"
      style={{
        height: 38,
        padding: 4,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        gap: 2,
      }}
    >
      <button
        type="button"
        onClick={() => setCurrency('IDR')}
        style={currency === 'IDR' ? activeBtn : baseBtn}
        aria-pressed={currency === 'IDR'}
      >
        IDR
      </button>
      <button
        type="button"
        onClick={() => setCurrency('USD')}
        style={currency === 'USD' ? activeBtn : baseBtn}
        aria-pressed={currency === 'USD'}
      >
        USD
      </button>
    </div>
  );
}
