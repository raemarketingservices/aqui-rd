/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        uniko: {
          blue: '#0033A0', // Azul Bandera
          red: '#CC0033',  // Rojo Bandera
          white: '#FFFFFF',// Blanco
          dark: '#0033A0',
          navy: '#0033A0',
          gray: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
