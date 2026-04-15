/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sidebar: '#080A0F',
        base: '#0D0F14',
        card: '#141720',
        'card-2': '#1A1E2A',
        teal: {
          DEFAULT: '#00C9A7',
          light: 'rgba(0,201,167,0.10)',
          dim: 'rgba(0,201,167,0.06)',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderColor: {
        subtle: 'rgba(255,255,255,0.06)',
        DEFAULT: 'rgba(255,255,255,0.06)',
      },
    },
  },
  plugins: [],
}
