/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // 480px sits between a typical phone (360–414px) and Tailwind's
      // default sm (640px). It lets us keep 2-up button grids on the
      // larger phones without forcing them on a Pixel 6 in portrait.
      screens: {
        xs: "480px",
      },
      colors: {
        ink: "#191714",
        paper: "#f7f3ea",
        teal: "#0f766e",
        coral: "#d85f45",
        amber: "#b7791f",
      },
      boxShadow: {
        soft: "0 16px 50px rgba(25, 23, 20, 0.10)",
      },
    },
  },
  plugins: [],
};
