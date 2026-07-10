import type { Config } from "tailwindcss";

/**
 * LAAL brand palette — fixed, from the Website SRS §2 and the Phase A design system.
 * These are the only brand colours; never hardcode hex values in components.
 *
 * The storefront is light-theme only by deliberate brand decision (the SRS mandates
 * the site stay "predominantly white") — there is no dark mode here on purpose.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        oxblood: "#4A0A12", // headings, logo, primary text, footer background
        ruby: "#8C1C35", // buttons, links, accents, the "+" in product names
        blush: "#FAF1F2", // section backgrounds, cards
        ink: "#241B1C", // body text
        muted: "#7C6B6D", // secondary text, captions, disclaimers
        line: "#E7D6D8", // hairline borders (tinted from blush/oxblood)
      },
      fontFamily: {
        // Values come from CSS variables set by next/font in app/layout.tsx,
        // with a system-stack default declared on `html` in app/globals.css.
        serif: ["var(--font-heading)"],
        sans: ["var(--font-body)"],
      },
      fontSize: {
        // Body floor is 17px so mobile never drops below the 16px SRS minimum.
        body: ["1.0625rem", { lineHeight: "1.6" }],
      },
      letterSpacing: {
        label: "0.16em", // uppercase section labels
        button: "0.12em", // buttons
        nav: "0.1em", // nav items
        wordmark: "0.14em",
      },
      borderRadius: {
        // Sharp-ish corners — clinical, not bubbly.
        card: "8px",
        panel: "10px",
        btn: "3px",
      },
      maxWidth: {
        shell: "1180px", // home / marketing shell
        page: "1100px", // product + shop shell
      },
      boxShadow: {
        float: "0 6px 18px rgba(74,10,18,0.28)",
        stickybar: "0 -4px 14px rgba(74,10,18,0.08)",
      },
      spacing: {
        section: "4.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
