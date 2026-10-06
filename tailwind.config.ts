import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ivory/soft-black/dusty-rose luxury palette (docs/design.md).
        // Token NAMES are unchanged from before so every existing consumer
        // (bg-bg, text-ink, border-accent, etc.) keeps working — only the
        // underlying hex values moved.
        bg: {
          DEFAULT: "#F8F5EF", // Ivory
          cream: "#E7DDD2", // Warm Beige — secondary section backgrounds
        },
        ink: {
          DEFAULT: "#171717", // Soft Black
          muted: "#75706A", // warm charcoal-gray, not a cold gray
        },
        charcoal: {
          DEFAULT: "#303030",
        },
        // Dusty Rose — reserved for SMALL accents only (focus rings,
        // selected swatch borders, sale-price text, link-hover underline).
        // Never the primary button/CTA color — those use `ink` (soft black)
        // per design.md section 31.
        accent: {
          DEFAULT: "#C99A96",
        },
        champagne: {
          DEFAULT: "#B9955B", // used extremely sparingly
        },
        destructive: {
          DEFAULT: "#DC2626",
        },
        success: {
          DEFAULT: "#16A34A",
        },
        border: "rgba(0,0,0,0.08)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-cormorant)", "serif"],
      },
      fontSize: {
        hero: ["clamp(3.5rem, 6vw, 4.5rem)", { lineHeight: "1.15" }],
        section: ["clamp(2.25rem, 4vw, 2.75rem)", { lineHeight: "1.2" }],
        "product-title": ["1.125rem", { lineHeight: "1.3" }],
        body: ["0.9375rem", { lineHeight: "1.6" }],
        "body-lg": ["1rem", { lineHeight: "1.6" }],
        caption: [
          "0.75rem",
          { lineHeight: "1.6", letterSpacing: "0.12em" },
        ],
      },
      spacing: {
        "30": "7.5rem",
      },
      maxWidth: {
        content: "1440px",
      },
      borderRadius: {
        DEFAULT: "4px",
        sm: "2px",
        md: "4px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(23,23,23,0.04), 0 8px 24px rgba(23,23,23,0.04)",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.25, 0.1, 0.25, 1)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        marquee: "marquee 30s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
