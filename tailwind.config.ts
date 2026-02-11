import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "Manrope", "system-ui", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "serif"],
        display: ["Playfair Display", "Georgia", "serif"],
        body: ["Inter", "Manrope", "sans-serif"],
      },
      colors: {
        // Premium Color Palette
        primary: {
          DEFAULT: "#6b8e6b",
          dark: "#557255",
          light: "#7fa87f",
          foreground: "#ffffff",
        },

        // Dark Theme Backgrounds
        "background-dark": "#0a0a0a",
        "surface-dark": "#121212",
        "card-dark": "#141514",
        "panel-dark": "#1a1c1a",
        "surface-highlight": "#1a1a1a",

        // Borders
        "border-dark": "#262626",
        "border-subtle": "#2f322f",

        // Legacy Shadcn colors (for compatibility)
        border: "hsl(var(--border-dark))",
        input: "#262626",
        ring: "#6b8e6b",
        background: "#0a0a0a",
        foreground: "#ffffff",
        secondary: {
          DEFAULT: "#121212",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#262626",
          foreground: "#a3a3a3",
        },
        accent: {
          DEFAULT: "#6b8e6b",
          foreground: "#ffffff",
        },
        popover: {
          DEFAULT: "#141514",
          foreground: "#ffffff",
        },
        card: {
          DEFAULT: "#141514",
          foreground: "#ffffff",
        },

        // Alpha Brand Colors (legacy)
        gold: {
          DEFAULT: "#d4af37",
          foreground: "#0a0a0a",
        },
        alpha: {
          charcoal: "#1a1a1a",
          black: "#0a0a0a",
          sage: "#6b8e6b",
          gold: "#d4af37",
          smoke: "#a3a3a3",
        },
        sidebar: {
          DEFAULT: "#0a0a0a",
          foreground: "#ffffff",
          primary: "#6b8e6b",
          "primary-foreground": "#ffffff",
          accent: "#262626",
          "accent-foreground": "#ffffff",
          border: "#262626",
          ring: "#6b8e6b",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "slide-up": {
          from: { transform: "translateY(100%)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "slide-up": "slide-up 0.5s ease-out",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-luxury": "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--background)) 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
