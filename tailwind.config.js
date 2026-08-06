/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          navy: '#0a0f18',
          darkCard: '#131b2b',
          bluePrimary: '#0066ff',
          cyanAccent: '#00ffff',
          tealSecondary: '#00b3b3',
          green: '#00e676',
          yellow: '#ffc400',
          red: '#ff1744'
        }
      }
    },
  },
  plugins: [],
}
