'use client';

import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title="Ubah tema"
      className="grid place-items-center text-base cursor-pointer transition-all rounded-[10px]"
      style={{
        width: 38,
        height: 38,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        color: 'var(--text)',
        fontFamily: 'inherit',
      }}
    >
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}
