// tailwind.config.ts
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
        mono: ['var(--font-roboto-mono)'],
        nunito: ['Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
