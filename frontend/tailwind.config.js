/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#12182B",
        inksoft: "#1D2540",
        paper: "#FAF8F4",
        border: "#E7E2D6",
        teal: "#0E7C7B",
        tealdeep: "#0A5F5E",
        amber: "#C98A2C",
        inktext: "#20242C",
        muted: "#6B7280",
      },
      fontFamily: {
        serif: ["'Fraunces'", "serif"],
        sans: ["'IBM Plex Sans'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
