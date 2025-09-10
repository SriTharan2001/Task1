const { text } = require('stream/consumers');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#ffffff",
          dark: "#14213D",
        },
        accent: {
          light: "#3E434CFF",
          dark: "#FCA311",
        },
        background: {
          light: "#3737F6FF",
          dark: "#01062FF5",
        },
        text: {
          light: "#000000",
          dark: "#FFFFFF",
        },
      },
    },
  },
  plugins: [],
};
