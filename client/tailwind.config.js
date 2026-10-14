/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FDF8F0',
          100: '#F9ECD7',
          200: '#F3D7AF',
          300: '#EABF80',
          400: '#E5A952',
          500: '#DFA048',
          600: '#C58B43',
          700: '#A36F32',
          800: '#7E5425',
          900: '#523415',
        },
        obsidian: {
          950: '#07090C',
          900: '#0B0D11',
          850: '#11141C',
          800: '#151922',
          750: '#1C212D',
          700: '#232A39',
        },
        alabaster: {
          50: '#FFFFFF',
          100: '#FAF8F5',
          200: '#F4EFEA',
          300: '#EAE6DF',
          400: '#D5CEC4',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Instrument Serif"', 'Georgia', 'serif'],
        display: ['"Plus Jakarta Sans"', '"Syne"', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-gold': '0 0 35px -5px rgba(229, 169, 82, 0.35)',
        'glow-amber': '0 0 25px -4px rgba(245, 158, 11, 0.4)',
        'glow-emerald': '0 0 25px -4px rgba(16, 185, 129, 0.3)',
        'soft-card': '0 8px 30px rgba(0, 0, 0, 0.04)',
        'dark-card': '0 8px 32px rgba(0, 0, 0, 0.45)',
      }
    },
  },
  plugins: [],
}
