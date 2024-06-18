import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  plugins: [require("@headlessui/tailwindcss")],
  theme: {
    colors: {
      transparent: "transparent",
      black: "#000000",
      white: "#ffffff",
      red: {
        400: "#c7444f",
        500: "#a22e38",
      },
      green: {
        500: "#405e63",
      },
      blue: {
        500: "#365a7b",
      },
      gray: {
        100: "#fbfbfb",
        200: "#f3f3f3",
        300: "#dee1dd",
        400: "#8c9da1",
        500: "#667375",
        600: "#4e585a",
        700: "#353c3d",
        800: "#141617",
      },
    },
    dropShadow: {
      sm: "0 8px 10px rgba(0, 0, 0, 0.1)",
    },
    fontFamily: {
      sans: ["var(--font-inter)"],
      mono: ["var(--font-roboto)"],
    },
    extend: {
      keyframes: {
        "fade-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(0.5rem)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-right": {
          "0%": {
            opacity: "0",
            transform: "translateX(-0.5rem)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        "fade-down": {
          "0%": {
            opacity: "0",
            transform: "translateY(-0.5rem)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-left": {
          "0%": {
            opacity: "0",
            transform: "translateX(0.5rem)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        blink: {
          "0%": {
            opacity: "1",
          },
          "100%": {
            opacity: "0.3",
          },
        },
        "toast-up": {
          from: { transform: "translateY(calc(100% + 1rem)) scale(0)" },
          to: { transform: "translateY(0) scale(1)" },
        },
        "toast-down": {
          from: { transform: "translateY(0) scale(1)" },
          to: { transform: "translateY(calc(100% + 1rem)) scale(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-right": "fade-right 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-down": "fade-down 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-left": "fade-left 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "toast-up": "toast-up 250ms cubic-bezier(0.16, 1, 0.3, 1)",
        "toast-down": "toast-down 300ms ease-out",
        blink: "blink 1s ease infinite",
      },
    },
  },
} satisfies Config;
