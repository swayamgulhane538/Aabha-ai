/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f5ff',
          100: '#e0ebff',
          200: '#c7d9ff',
          300: '#a3bfff',
          400: '#7a9cff',
          500: '#5b7bfa',
          600: '#4361ee',
          700: '#3651d4',
          800: '#2e44ab',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: [
          'Plus Jakarta Sans',
          'Noto Sans Devanagari',
          'Poppins',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
      },
      borderRadius: {
        'micro': '4px',
        'standard': '8px',
        'card': '16px',
        'container': '24px',
        'pill': '9999px',
      }
    },
  },
  plugins: [],
};
