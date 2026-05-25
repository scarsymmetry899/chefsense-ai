import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        // ChefSense palette — mirrored to CSS variables in globals.css
        background: 'hsl(var(--background) / <alpha-value>)',
        surface: 'hsl(var(--surface) / <alpha-value>)',
        'surface-warm': 'hsl(var(--surface-warm) / <alpha-value>)',
        card: 'hsl(var(--card) / <alpha-value>)',
        foreground: 'hsl(var(--text) / <alpha-value>)',
        muted: {
          DEFAULT: 'hsl(var(--surface-warm) / <alpha-value>)',
          foreground: 'hsl(var(--text-muted) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          dark: 'hsl(var(--primary-dark) / <alpha-value>)',
          soft: 'hsl(var(--primary-soft) / <alpha-value>)',
          foreground: 'hsl(var(--surface) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
          soft: 'hsl(var(--secondary-soft) / <alpha-value>)',
        },
        accent: {
          green: 'hsl(var(--accent-green) / <alpha-value>)',
          'green-soft': 'hsl(var(--accent-green-soft) / <alpha-value>)',
        },
        copper: 'hsl(var(--copper) / <alpha-value>)',
        turmeric: 'hsl(var(--turmeric) / <alpha-value>)',
        chilli: 'hsl(var(--chilli) / <alpha-value>)',
        border: 'hsl(var(--border) / <alpha-value>)',
        success: 'hsl(var(--success) / <alpha-value>)',
        warning: 'hsl(var(--warning) / <alpha-value>)',
        danger: 'hsl(var(--danger) / <alpha-value>)',
        // semantic text aliases
        'text-strong': 'hsl(var(--text) / <alpha-value>)',
        'text-muted': 'hsl(var(--text-muted) / <alpha-value>)',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 4px)',
        sm: 'calc(var(--radius) - 8px)',
        xl: 'calc(var(--radius) + 6px)',
        '2xl': 'calc(var(--radius) + 12px)',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(58, 36, 23, 0.04), 0 4px 16px rgba(58, 36, 23, 0.06)',
        card: '0 2px 8px rgba(58, 36, 23, 0.06), 0 8px 28px rgba(58, 36, 23, 0.05)',
        cta: '0 6px 18px rgba(230, 90, 46, 0.28), 0 2px 4px rgba(230, 90, 46, 0.18)',
        inset: 'inset 0 1px 0 rgba(255, 255, 255, 0.6)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.9' },
          '50%': { opacity: '0.5' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
        shimmer: 'shimmer 2.4s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
