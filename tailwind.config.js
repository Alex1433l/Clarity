/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'DM Sans', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Syne', 'Rajdhani', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  'rgb(var(--brand-50)  / <alpha-value>)',
          100: 'rgb(var(--brand-100) / <alpha-value>)',
          200: 'rgb(var(--brand-200) / <alpha-value>)',
          300: 'rgb(var(--brand-300) / <alpha-value>)',
          400: 'rgb(var(--brand-400) / <alpha-value>)',
          500: 'rgb(var(--brand-500) / <alpha-value>)',
          600: 'rgb(var(--brand-600) / <alpha-value>)',
          700: 'rgb(var(--brand-700) / <alpha-value>)',
          800: 'rgb(var(--brand-800) / <alpha-value>)',
          900: 'rgb(var(--brand-900) / <alpha-value>)',
          950: 'rgb(var(--brand-950) / <alpha-value>)',
        },
        sand: {
          50:  '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
          950: '#0c0a09',
        },
      },
      boxShadow: {
        soft:     'var(--shadow-soft,     0 1px 2px 0 rgb(0 0 0/0.04), 0 1px 3px 0 rgb(0 0 0/0.06))',
        card:     'var(--shadow-card,     0 1px 3px 0 rgb(0 0 0/0.05), 0 4px 12px -2px rgb(0 0 0/0.06))',
        elevated: 'var(--shadow-elevated, 0 4px 24px -4px rgb(0 0 0/0.10), 0 2px 6px -2px rgb(0 0 0/0.06))',
        glow:     'var(--shadow-glow,     0 0 0 transparent)',
      },
      borderRadius: {
        xl:  '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        full: '9999px',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to:   { transform: 'translateX(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 8px rgb(0 168 137 / 0.40)' },
          '50%':       { boxShadow: '0 0 22px rgb(0 195 160 / 0.70)' },
        },
      },
      animation: {
        'fade-in':       'fade-in 0.3s ease-out',
        'scale-in':      'scale-in 0.2s ease-out',
        'slide-up':      'slide-up 0.4s ease-out',
        'slide-in-right':'slide-in-right 0.3s ease-out',
        'pulse-glow':    'pulse-glow 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
