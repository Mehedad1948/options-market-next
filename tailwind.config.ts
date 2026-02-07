import type { Config } from "tailwindcss";
// const { fontFamily } = require("tailwindcss/defaultTheme"); // If you need default theme

const config: Config = {
  darkMode: 'class', // Ensure this is set for your ThemeProvider
 
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
    },
  },
  plugins: [],
};
export default config;
