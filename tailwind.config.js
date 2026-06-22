import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'phone': '480px',        
        'tablet': '768px', 
        'desktop': '1240px',     
        'desktop-wide': '1700px', 
        'screen-4k': '3840px',   
      },
      colors: {
        customBlue: '#6D28D9',
        customPurple: '#6D28D9',
        customPurpleDark: '#4C1D95',
        customPurpleLight: '#F4F0FF',
        customGreen: '#0F9670',
        customRed: '#DB5A63',
        customOrange: '#E79937',
        bgBlue: '#F7F7FB',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
  variants: {
    scrollbar: ['rounded'],
  },
};
