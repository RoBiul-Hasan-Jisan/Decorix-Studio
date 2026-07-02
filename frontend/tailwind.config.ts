import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./context/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F6F1EA",
        clay: "#B5652E",
        sage: "#5C6B4F",
        charcoal: "#22201C",
        sand: "#E7DCC9",
        stone: "#8C8377",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 30px rgba(34, 32, 28, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
