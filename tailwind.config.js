/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        bg: '#0a0e1a',
        surface: '#111827',
        surface2: '#1a2235',
        border: '#1f2d45',
        accent: '#00d4ff',
        violet: '#7c3aed',
        amber: '#f59e0b',
        emerald: '#10b981',
      },
      animation: {
        'blink': 'blink 2s ease-in-out infinite',
        'spin-slow': 'spin 0.8s linear infinite',
        'fade-up': 'fadeUp 0.4s ease forwards',
      },
      keyframes: {
        blink: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
        fadeUp: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
