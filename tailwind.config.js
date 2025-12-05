/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#F9F8F6',   // Lightest warm background
          100: '#F5F3F0',  // Warm gray background
          200: '#E8E4DF',  // Light warm gray
          300: '#D4CEC5',  // Warm gray
          400: '#B8B0A3',  // Mid warm gray
          500: '#9B9184',  // Medium warm gray
          600: '#7D7468',  // Dark warm gray
          700: '#625A50',  // Deeper warm gray
          800: '#4A443C',  // Warm dark
          900: '#2A2520',  // Warm black
        },
        accent: {
          primary: '#B8906A',   // Warm bronze
          secondary: '#A67D56', // Deeper bronze
          hover: '#9A7149',     // Darkest bronze
        }
      },
      borderRadius: {
        card: '12px',    // Softer cards
      },
      boxShadow: {
        warm: '0 2px 12px rgba(42, 37, 32, 0.06)',
        'warm-md': '0 4px 16px rgba(42, 37, 32, 0.08)',
        'warm-lg': '0 8px 24px rgba(42, 37, 32, 0.10)',
      }
    },
  },
  plugins: [],
}
