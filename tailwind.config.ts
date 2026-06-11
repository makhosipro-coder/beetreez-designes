import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: {
          bg: 'var(--color-canvas-bg)',
          surface: 'var(--color-surface)',
          grid: 'var(--color-grid)',
          accent: 'var(--color-accent)',
          'accent-hover': 'var(--color-accent-hover)',
          hover: 'var(--color-hover)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          grid: 'var(--color-grid)',
        },
        brand: {
          primary: 'var(--color-accent)',
          secondary: '#ff6584',
          tertiary: '#45eba5',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
        },
      },
      spacing: {
        sidebar: '280px',
        header: '56px',
        'panel-sm': '240px',
        'panel-md': '320px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'scale-in': 'scaleIn 0.15s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(8px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        scaleIn: { '0%': { transform: 'scale(0.95)' }, '100%': { transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
};

export default config;
