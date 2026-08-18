/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        // Shared orb motion vocabulary. Part B owns how these are composed.
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.85' },
          '50%': { transform: 'scale(1.06)', opacity: '1' },
        },
        ripple: {
          '0%': { transform: 'scale(1)', opacity: '0.5' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        drift: {
          '0%, 100%': { transform: 'translate3d(0,0,0) rotate(0deg)' },
          '33%': { transform: 'translate3d(6%,-4%,0) rotate(120deg)' },
          '66%': { transform: 'translate3d(-5%,5%,0) rotate(240deg)' },
        },
      },
      animation: {
        breathe: 'breathe 4s ease-in-out infinite',
        ripple: 'ripple 2s ease-out infinite',
        drift: 'drift 12s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
