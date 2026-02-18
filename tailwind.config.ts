import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["'Sora'", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        brand: {
          50: "#eefcf9",
          100: "#d7f7f0",
          200: "#b1eedf",
          300: "#80dfca",
          400: "#45c7ac",
          500: "#22ad91",
          600: "#178a74",
          700: "#146d5f",
          800: "#14584e",
          900: "#124941"
        },
        accent: {
          50: "#fff6ed",
          100: "#ffead6",
          200: "#ffd1ad",
          300: "#ffaf77",
          400: "#ff8740",
          500: "#ff681a",
          600: "#f14c0f",
          700: "#c83810",
          800: "#9f2f16",
          900: "#7f2915"
        }
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        popIn: {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        },
        toastIn: {
          "0%": { opacity: "0", transform: "translateX(28px)" },
          "100%": { opacity: "1", transform: "translateX(0)" }
        }
      },
      animation: {
        fadeIn: "fadeIn 220ms ease-out",
        slideUp: "slideUp 260ms ease-out",
        popIn: "popIn 180ms ease-out",
        toastIn: "toastIn 240ms ease-out"
      },
      boxShadow: {
        glow: "0 16px 42px -20px rgba(34, 173, 145, 0.75)"
      }
    }
  },
  plugins: []
} satisfies Config;
