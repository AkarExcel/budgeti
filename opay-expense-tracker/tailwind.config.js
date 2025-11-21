/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1200px',
      },
    },
    extend: {
      colors: {
        // OPay Primary Colors
        primary: {
          50: '#E6F9F4',
          400: '#39D9AD',
          500: '#1DCF9F',
          600: '#17B88C',
        },
        // Gamification Accents
        gamification: {
          gold: '#F59E0B',
          fire: '#EF4444',
          cyan: '#2BE2FA',
        },
        // Neutral Palette
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          400: '#A3A3A3',
          700: '#404040',
          900: '#171717',
        },
        // Semantic Colors
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
        // Background Layers
        background: {
          page: '#FAFAFA',
          surface: '#FFFFFF',
          elevated: '#FFFFFF',
        },
      },
      fontSize: {
        'display-lg': ['48px', { lineHeight: '1.2', fontWeight: '700' }],
        'display-md': ['32px', { lineHeight: '1.25', fontWeight: '700' }],
        'heading-xl': ['24px', { lineHeight: '1.3', fontWeight: '700' }],
        'heading-lg': ['20px', { lineHeight: '1.35', fontWeight: '600' }],
        'heading-md': ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '500' }],
        'body-base': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'label-md': ['14px', { lineHeight: '1.4', fontWeight: '600' }],
        'label-sm': ['12px', { lineHeight: '1.3', fontWeight: '600' }],
        'caption': ['12px', { lineHeight: '1.4', fontWeight: '400' }],
      },
      spacing: {
        '4': '4px',
        '8': '8px',
        '12': '12px',
        '16': '16px',
        '24': '24px',
        '32': '32px',
        '48': '48px',
        '56': '56px',
        '64': '64px',
        '96': '96px',
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        'full': '9999px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 4px 16px rgba(29, 207, 159, 0.12), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'fab': '0 8px 24px rgba(29, 207, 159, 0.2), 0 4px 8px rgba(0, 0, 0, 0.08)',
      },
      transitionDuration: {
        'instant': '100ms',
        'fast': '150ms',
        'base': '200ms',
        'slow': '300ms',
        'celebration': '400ms',
      },
      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bouncy': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' },
          '50%': { boxShadow: '0 4px 16px rgba(29, 207, 159, 0.12)' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-2px)' },
          '75%': { transform: 'translateX(2px)' },
        },
        'scale-bounce': {
          '0%': { transform: 'scale(0.5)' },
          '60%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1.0)' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'shake': 'shake 150ms ease-in-out',
        'scale-bounce': 'scale-bounce 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
