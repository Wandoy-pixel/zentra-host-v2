import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0a0e1a',
          card: '#131829',
          surface: '#1a2138',
        },
        brand: {
          accent: '#14b8a6',
          accentHover: '#0d9488',
          secondary: '#6366f1',
        },
        text: {
          DEFAULT: '#e6e9f2',
          muted: '#8b93a7',
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #14b8a6 0%, #6366f1 100%)',
        'gradient-text': 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 50%, #ec4899 100%)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 2s infinite',
        'slide-up': 'slideUp 0.25s ease',
        'fade-in': 'fadeIn 0.2s ease',
        'shimmer': 'shimmer 1.5s infinite linear',
      },
      keyframes: {
        slideUp: {
          'from': { transform: 'translateY(20px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: 'calc(200px + 100%) 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
