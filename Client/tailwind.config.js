// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#14213D",   // dark navy blue
        accent: "#FCA311",    // orange
        dark: "#000000",      // black
      },
       fontFamily: {
        inter: ['Inter', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        opensans: ['Open Sans', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'],
        dmsans: ['DM Sans', 'sans-serif'],
        rubik: ['Rubik', 'sans-serif'],
        sans: ['Inter', 'sans-serif'], // Default fallback
      }
    },
  },
  plugins: [],
};
