/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontSize: {
        button: "2rem",
        subtitle: "2.8rem",
      },
      width: {
        walletInfo: "17rem",
        mainButton: "38rem",
      },
      height: {
        walletInfo: "5.5rem",
        mainButton: "38rem",
      },
      colors: {
        purple1: "#5F18D1",
        pink1: "#FF62D6",
        pink2: "#FF9EE6",
      },
    },
  },
  plugins: [],
};
