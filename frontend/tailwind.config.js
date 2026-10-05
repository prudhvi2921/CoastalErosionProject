/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060d17',
          900: '#0a1628',
          850: '#0e1e36',
          800: '#142948',
          700: '#1e3a5f',
          600: '#2c4f7c',
        },
        ocean: {
          teal: '#0ea5e9',
          cyan: '#06b6d4',
          emerald: '#10b981',
          slate: '#334155',
        },
        risk: {
          low: '#0d9488',
          lowBg: '#f0fdfa',
          lowBorder: '#5eead4',
          mod: '#d97706',
          modBg: '#fffbeb',
          modBorder: '#fcd34d',
          high: '#ea580c',
          highBg: '#fff7ed',
          highBorder: '#fdba74',
          vhigh: '#dc2626',
          vhighBg: '#fef2f2',
          vhighBorder: '#fca5a5',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
