/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Warm color backgrounds
    'bg-warm-50', 'bg-warm-100', 'bg-warm-200', 'bg-warm-800', 'bg-warm-900',
    'dark:bg-warm-800', 'dark:bg-warm-900',
    'bg-warm-100/80', 'dark:bg-warm-800/80',
    // Warm color text
    'text-warm-50', 'text-warm-100', 'text-warm-200', 'text-warm-400', 'text-warm-600', 'text-warm-800',
    'dark:text-warm-100', 'dark:text-warm-200', 'dark:text-warm-400',
    // Warm color borders
    'border-warm-200', 'border-warm-700',
    'dark:border-warm-700',
    'border-warm-200/50', 'border-warm-700/50',
    'dark:border-warm-700/50',
    // Warm accent colors
    'text-warm-accent-400',
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      fontFamily: {
        'serif': ['Playfair Display', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Warm Minimal palette - cream, beige, and warm browns
        warm: {
          // Light mode: soft creams and beiges
          50: '#FBF9F6',   // Cream white - main background
          100: '#F7F3ED',  // Warm cream - card bg
          200: '#F0EBE3',  // Soft beige - borders
          300: '#E8E0D5',  // Light beige
          400: '#D4C9BA',  // Warm beige - muted elements
          500: '#B8AA96',  // Medium beige - subtle text
          600: '#9B8B76',  // Mid brown
          // Dark mode: warm browns and deep tones
          700: '#6B5D4F',  // Warm brown - lighter dark text
          800: '#4A4036',  // Dark cocoa - card background (dark mode)
          900: '#2F2B26',  // Deep warm - main background (dark mode)
          950: '#1C1815',  // Deepest warm black
        },
        // Warm terracotta/caramel accents
        'warm-accent': {
          50: '#FFF4E6',
          100: '#FFE8CC',
          200: '#FFD699',
          300: '#FFBB66',
          400: '#E88433',   // Warm terracotta - main accent
          500: '#CC6A28',   // Rich caramel - hover
          600: '#A65420',   // Deep terracotta
          700: '#804018',   // Darker
          800: '#5C2D10',   // Deepest
          900: '#3D2408',   // Even deeper
        }
      },
    },
  },
  plugins: [],
}
