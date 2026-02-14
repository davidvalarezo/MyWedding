/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#FDFBF7",
          dark: "#F5F0E6",
        },
        gold: {
          light: "#E5C158",
          DEFAULT: "#D4AF37",
          dark: "#B8860B",
        },
        'card-gold': "#F9F3E5",
      },
      fontFamily: {
        serif: ['Inter', 'serif'], // I'll use standard serif for now, but will link Google Fonts
        romantic: ['"Playfair Display"', 'serif'],
        body: ['"Lato"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
