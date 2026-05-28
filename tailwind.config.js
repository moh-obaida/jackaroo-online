/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        wood: {
          50: '#fdf8f0',
          100: '#f5e6d0',
          200: '#e8c99a',
          300: '#d4a563',
          400: '#c08a3e',
          500: '#a06b2a',
          600: '#7d5220',
          700: '#5c3c18',
          800: '#3d2810',
          900: '#2a1a0a',
        },
        gold: {
          50: '#fffdf0',
          100: '#fff8d4',
          200: '#ffefa3',
          300: '#ffe066',
          400: '#ffd633',
          500: '#e6b800',
          600: '#b38f00',
          700: '#806600',
          800: '#4d3d00',
          900: '#1a1400',
        },
        cream: {
          50: '#faf7f2',
          100: '#f5f0e8',
          200: '#e8dcc8',
        },
        board: {
          dark: '#1a1208',
          medium: '#2d2010',
          light: '#4a3520',
        },
        surface: {
          base: '#14100c',
          panel: '#221a12',
          inset: '#0f0c09',
        },
        spot: {
          track: '#c9b896',
          home: '#b8a078',
        },
        player: {
          black: '#2a2a2a',
          green: '#2d8a4e',
          blue: '#2563eb',
          white: '#f0ebe0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['Noto Sans Arabic', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        board: '0 8px 32px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
      },
    },
  },
  plugins: [],
};
