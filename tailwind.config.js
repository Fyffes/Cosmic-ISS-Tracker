/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deine Hintergrundfarbe aus dem CSS als "slate-950" Ersatz oder "brand-dark"
        dark: {
          DEFAULT: '#020617',
          card: '#1e293b', // Passend zu deinem Scrollbar-Thumb
        },
        accent: {
          blue: '#3b82f6', // Dein Blau für Hover-Effekte
        }
      },
      // Falls du den Glass-Effekt oft nutzt, kannst du hier Standard-Werte definieren
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [
    // Falls noch nicht installiert, empfehle ich: 
    // npm install -D @tailwindcss/typography @tailwindcss/forms
    // require('@tailwindcss/typography'),
    // require('@tailwindcss/forms'),
  ],
}