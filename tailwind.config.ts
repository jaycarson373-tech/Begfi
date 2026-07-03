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
        beg: {
          black: "#030005",
          ink: "#08050d",
          glass: "rgba(255, 255, 255, 0.08)",
          line: "rgba(255, 255, 255, 0.14)",
          purple: "#9b5cff",
          violet: "#6f36ff",
          magenta: "#e05bff",
          lime: "#bcff6b",
          steel: "#d7d4e2"
        }
      },
      boxShadow: {
        glow: "0 0 54px rgba(155, 92, 255, 0.34)",
        panel: "0 24px 80px rgba(0, 0, 0, 0.42)"
      },
      keyframes: {
        pulseLine: {
          "0%, 100%": { opacity: "0.2", transform: "translateX(-12%)" },
          "50%": { opacity: "0.75", transform: "translateX(12%)" }
        },
        floatSlow: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -14px, 0)" }
        }
      },
      animation: {
        "pulse-line": "pulseLine 7s ease-in-out infinite",
        "float-slow": "floatSlow 8s ease-in-out infinite"
      }
    }
  },
  plugins: []
} satisfies Config;

export default config;
