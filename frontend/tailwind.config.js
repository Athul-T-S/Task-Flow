// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Jira primary blue
        primary: {
          DEFAULT: '#0052CC',
          50: '#E6F0FF',
          100: '#CCE0FF',
          200: '#85B8FF',
          300: '#4C9AFF',
          400: '#2684FF',
          500: '#0052CC',
          600: '#0747A6',
          700: '#003884',
          800: '#002966',
          900: '#001A47',
        },
        // Jira dark navy (text/sidebar)
        navy: {
          DEFAULT: '#172B4D',
          50: '#F4F5F7',
          100: '#EBECF0',
          200: '#DFE1E6',
          300: '#C1C7D0',
          400: '#97A0AF',
          500: '#7A869A',
          600: '#6B778C',
          700: '#505F79',
          800: '#42526E',
          900: '#172B4D',
        },
        // Backgrounds
        surface: '#F4F5F7',
        card: '#FFFFFF',
        // Status colors
        todo: '#42526E',
        'in-progress': '#0052CC',
        done: '#36B37E',
        // Priority colors
        highest: '#FF5630',
        high: '#FF7452',
        medium: '#FFAB00',
        low: '#36B37E',
        lowest: '#97A0AF',
        // Semantic
        success: '#36B37E',
        warning: '#FFAB00',
        danger: '#FF5630',
        info: '#00B8D9',
      },
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.12), 0 1px 2px 0 rgba(0,0,0,0.06)',
        modal: '0 8px 32px 0 rgba(9, 30, 66, 0.25)',
        panel: '-4px 0 20px 0 rgba(9, 30, 66, 0.15)',
      },
      animation: {
        'slide-in-right': 'slideInRight 0.25s ease-out',
        'fade-in': 'fadeIn 0.15s ease-out',
      },
      keyframes: {
        slideInRight: {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
