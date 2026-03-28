/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/context/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {},
      fontFamily: {
        'sans': ['Helvetica', 'sans-serif'],
      },
    },
  },
  plugins: [],
};