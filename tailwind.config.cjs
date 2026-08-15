/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          300: '#8b5cf6',
          500: '#6366f1',
          600: '#4f46e5',
        },
        accent: {
          50: '#ecfeff',
          400: '#06b6d4',
          600: '#0891b2',
        },
      },
      boxShadow: {
        'glass': '0 8px 30px rgba(2,6,23,0.08)',
      },
    },
  },
  plugins: [],
}
