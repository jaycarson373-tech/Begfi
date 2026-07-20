import type { Config } from "tailwindcss";

const config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        pow: {
          blue: "#075DFF",
          glow: "#1F75FF",
          dark: "#010512",
          navy: "#020817"
        }
      }
    }
  },
  plugins: []
} satisfies Config;

export default config;
