import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2E7D32',
          50: '#E8F5E9',
          100: '#C8E6C9',
          200: '#A5D6A7',
          300: '#81C784',
          400: '#66BB6A',
          500: '#4CAF50',
          600: '#43A047',
          700: '#388E3C',
          800: '#2E7D32',
          900: '#1B5E20',
        },
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'sans-serif'],
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 4px 20px rgba(46,125,50,0.25)' },
          '50%': { transform: 'scale(1.12)', boxShadow: '0 8px 32px rgba(46,125,50,0.45)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        breathe: 'breathe 2s ease-in-out infinite',
        fadeIn: 'fadeIn 0.3s ease-out both',
        slideUp: 'slideUp 0.4s ease-out both',
        slideInRight: 'slideInRight 0.35s cubic-bezier(0.32,0.72,0,1)',
      },
    },
  },
  plugins: [],
}
export default config
