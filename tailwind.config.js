/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        windows: {
          bg: '#f3f3f3',
          card: '#ffffff',
          border: '#e5e5e5',
          primary: '#0078d4',
          primaryHover: '#006cc1',
          text: '#202020',
          textSecondary: '#606060',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'windows': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'windows-lg': '0 4px 16px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}
