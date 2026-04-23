/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper:   '#EDE9E2',
        sidebar: '#E5E1D8',
        card:    '#FAFAF8',
        'card-2':'#F4F0E8',
        ink:     '#1C1008',
        'ink-2': '#5C3D2E',
        brown: {
          DEFAULT: '#7C5234',
          light:   'rgba(124,82,52,0.10)',
          dim:     'rgba(124,82,52,0.06)',
          dark:    '#3C2410',
        },
        steel: {
          DEFAULT: '#3D6080',
          light:   'rgba(61,96,128,0.10)',
        },
        sage: {
          DEFAULT: '#4A7062',
          light:   'rgba(74,112,98,0.10)',
        },
        rust: {
          DEFAULT: '#B44040',
          light:   'rgba(180,64,64,0.10)',
        },
        amber: {
          DEFAULT: '#C4922A',
          light:   'rgba(196,146,42,0.10)',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans:  ['DM Sans', 'sans-serif'],
        mono:  ['JetBrains Mono', 'monospace'],
      },
      borderColor: {
        DEFAULT: 'rgba(28,16,8,0.09)',
      },
    },
  },
  plugins: [],
}
