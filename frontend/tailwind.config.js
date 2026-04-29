/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0f172a',
          accent: '#2563eb',
        },
        nova: {
          dark: '#0a0a0a',
          'dark-2': '#141414',
          'dark-3': '#1e1e1e',
          'dark-4': '#2a2a2a',
          bg: '#f5f5f7',
          blue: '#2563eb',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
