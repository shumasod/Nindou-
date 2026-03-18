import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        aoi: {
          DEFAULT: "#0e7490",
          light: "#cffafe",
          dark: "#164e63",
        },
        mio: {
          DEFAULT: "#e11d48",
          light: "#ffe4e6",
          dark: "#9f1239",
        },
        kenji: {
          DEFAULT: "#475569",
          light: "#f1f5f9",
          dark: "#1e293b",
        },
        night: "#0d0f14",
        dusk: "#1a1d2e",
        dawn: "#f8f0e3",
      },
      fontFamily: {
        sans: ["'Noto Sans JP'", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "typewriter": "typewriter 0.05s steps(1) forwards",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "blink": "blink 1s step-end infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
