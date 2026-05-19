import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Figma design tokens (exact)
        "nox-green":       "#1b4332",
        "nox-green-light": "#2d6a4f",
        "nox-green-hover": "#163828",
        "nox-cream":       "#f5f0e8",
        "nox-amber":       "#f97316",
        "nox-charcoal":    "#1c1c1e",
        "nox-slate":       "#6b7280",
        "nox-success":     "#10b981",
        "nox-danger":      "#dc2626",
        "nox-dark":        "#0d1f17",
        "nox-dark-card":   "#122b1e",

        // Aliases Tailwind CSS (compatibilité composants existants)
        border:     "hsl(var(--border))",
        input:      "hsl(var(--input))",
        ring:       "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "#1b4332",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT:    "#f97316",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT:    "#f5f0e8",
          foreground: "#6b7280",
        },
      },
      fontFamily: {
        body:    ["var(--font-body)",    "DM Sans",           "system-ui", "sans-serif"],
        heading: ["var(--font-heading)", "DM Serif Display",  "Georgia",   "serif"],
        mono:    ["JetBrains Mono",      "Courier New",       "monospace"],
        sans:    ["var(--font-body)",    "DM Sans",           "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "14px",
        md: "10px",
        sm:  "6px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
