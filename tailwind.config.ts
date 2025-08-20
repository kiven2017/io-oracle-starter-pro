import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        black: "#0B0F14",
        gold: "#D4AF37",
        "gold-dark": "#B5942B",
        "text-secondary": "#BBBBBB"
      },
      boxShadow: {
        "gold-glow": "0 0 0 2px rgba(212,175,55,0.35), 0 10px 25px rgba(212,175,55,0.15)"
      }
    }
  },
  plugins: []
};
export default config;
