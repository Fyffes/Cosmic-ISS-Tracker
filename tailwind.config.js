/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: { 
        dark: {
          DEFAULT: '#020617',
          card: '#1e293b', 
        },
        accent: {
          blue: '#3b82f6', 
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}