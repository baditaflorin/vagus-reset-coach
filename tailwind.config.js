/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#191714',
        paper: '#f7f3ea',
        teal: '#0f766e',
        coral: '#d85f45',
        amber: '#b7791f',
      },
      boxShadow: {
        soft: '0 16px 50px rgba(25, 23, 20, 0.10)',
      },
    },
  },
  plugins: [],
}
