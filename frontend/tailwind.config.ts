import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-news)', 'Georgia', 'serif'],
        markets: ['var(--font-markets)', 'var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        'markets-mono': ['var(--font-markets-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: { DEFAULT: '#0f172a', muted: '#475569', soft: '#64748b' },
        paper: '#fafaf9',
        surface: { DEFAULT: '#f4f4f5', subtle: '#e7e5e4', card: '#ffffff' },
        accent: {
          DEFAULT: '#0d9488',
          dark: '#0f766e',
          light: '#14b8a6',
          soft: '#ccfbf1',
          glow: '#5eead4',
        },
        brand: {
          night: '#0a1628',
          deep: '#0f172a',
          sea: '#0f766e',
          tide: '#134e4a',
        },
      },
      boxShadow: {
        card: '0 4px 24px -4px rgb(15 23 42 / 0.08), 0 2px 8px -2px rgb(15 23 42 / 0.06)',
        lift: '0 12px 40px -16px rgb(15 23 42 / 0.12), 0 4px 16px -8px rgb(15 23 42 / 0.08)',
        hero: '0 25px 80px -20px rgb(0 0 0 / 0.45), 0 0 0 1px rgb(255 255 255 / 0.06) inset',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
