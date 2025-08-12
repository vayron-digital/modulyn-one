const { fontFamily } = require("tailwindcss/defaultTheme")

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        /* Design system colors mapped to HSL CSS vars so we can use opacity utilities */
        "surface-primary": "hsl(var(--surface-primary-hsl) / <alpha-value>)",
        "surface-secondary": "hsl(var(--surface-secondary-hsl) / <alpha-value>)",
        "text-heading": "hsl(var(--text-heading-hsl) / <alpha-value>)",
        "text-secondary": "hsl(var(--text-body-hsl) / <alpha-value>)",
        "text-on-dark": "hsl(var(--text-on-dark-hsl) / <alpha-value>)",
        "primary-default": "hsl(var(--primary-default-hsl) / <alpha-value>)",
        "primary-on-primary": "hsl(var(--primary-on-primary-hsl) / <alpha-value>)",
        "primary-tint": "hsl(var(--primary-tint-hsl) / <alpha-value>)",
        "primary-shade": "hsl(var(--primary-shade-hsl) / <alpha-value>)",
        "decorative-default": "hsl(var(--decorative-default-hsl) / <alpha-value>)",
        "decorative-tint": "hsl(var(--decorative-tint-hsl) / <alpha-value>)",
        "decorative-shade": "hsl(var(--decorative-shade-hsl) / <alpha-value>)",
        "highlight-default": "hsl(var(--highlight-default-hsl) / <alpha-value>)",
        "states-error": "hsl(var(--states-error-hsl) / <alpha-value>)",
        "states-warning": "hsl(var(--states-warning-hsl) / <alpha-value>)",
        "states-success": "hsl(var(--states-success-hsl) / <alpha-value>)",
        "fields-border": "hsl(var(--fields-border-hsl) / <alpha-value>)",
        "obsidian-veil": "hsl(var(--obsidian-veil-hsl) / <alpha-value>)",
        "charcoal-tint": "hsl(var(--charcoal-tint-hsl) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/forms")],
} 