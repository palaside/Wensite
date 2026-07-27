module.exports = {
  content: ['./src/**/*.{tsx,ts,jsx,js,html}'],
  theme: {
    extend: {
      fontFamily: {
        thai: ['Sarabun', 'Inter', 'sans-serif'],
      },
      screens: {
        xs: '360px', // extra small breakpoint for very small devices
      },
    },
  },
  plugins: [],
};
