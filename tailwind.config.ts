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
          blue: "#1E5EFF",
          glow: "#3B82F6",
          dark: "#05070C",
          navy: "#07142E"
        }
      }
    }
  },
  plugins: []
} satisfies Config;

export default config;
