/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        aqui: {
          dark: '#0F2A4A',
          blue: '#1B4B8A',
          lightblue: '#3B82F6',
          orange: '#FF6B35',
          green: '#28A745',
          red: '#E53E3E',
          gray: '#6B7280',
          lightgray: '#F3F4F6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
