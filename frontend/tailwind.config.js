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
        cyber: {
          bg: '#0A0F1D',
          surface: '#11182A',
          card: '#162035',
          cardHover: '#1B2742',
          border: '#233354',
          neonCyan: '#00F0FF',
          neonTeal: '#00F5D4',
          neonGreen: '#10B981',
          neonAmber: '#F59E0B',
          neonRed: '#EF4444',
          textMuted: '#94A3B8',
          textBright: '#F8FAFC'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
