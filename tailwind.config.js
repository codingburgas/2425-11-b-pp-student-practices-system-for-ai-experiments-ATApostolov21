/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      blur: {
        '3xl': '64px',
        '4xl': '96px',
      },
    },
  },
  plugins: [],
} 