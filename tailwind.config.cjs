/** @type {import('tailwindcss').Config} */
module.exports = {
  // Enable dark mode via a `.dark` class on <html> or <body>
  darkMode: 'class',
  content: [
    // Next.js /app and /pages
    './src/app/**/*.{js,jsx,ts,tsx,html}',
    './pages/**/*.{js,jsx,ts,tsx,html}',

    // Components and root src
    './src/components/**/*.{js,jsx,ts,tsx,html}',
    './components/**/*.{js,jsx,ts,tsx,html}',
    './src/**/*.{js,jsx,ts,tsx,html}',

    // Public static HTML (if any)
    './public/**/*.html',
  ],
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
