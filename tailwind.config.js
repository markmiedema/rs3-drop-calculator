/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // RS3 Drop Calculator color scheme
        'rs3-purple': '#8b5cf6',
        'rs3-amber': '#fbbf24',
        'rs3-green': '#10b981',
      },
    },
  },
  plugins: [],
}
