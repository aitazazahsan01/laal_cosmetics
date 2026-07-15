import { Cormorant_Garamond, Inter } from "next/font/google";

/**
 * Typography.
 *
 * next/font/google downloads and self-hosts these at build time — no runtime request to
 * Google, no layout shift, and it works in production behind any CDN.
 *
 * If a build environment ever cannot reach fonts.gstatic.com, this is the only file that
 * needs to change: delete the two calls below and export
 *   export const headingFont = { variable: "" };
 *   export const bodyFont = { variable: "" };
 * The system stacks declared on `html` in app/globals.css then take over automatically,
 * because that is where the --font-heading / --font-body defaults live.
 */

export const headingFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal"],
  variable: "--font-heading",
  display: "swap",
  fallback: [
    "Iowan Old Style",
    "Palatino Linotype",
    "Palatino",
    "Georgia",
    "serif",
  ],
});

export const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  fallback: [
    "-apple-system",
    "Segoe UI",
    "Roboto",
    "Helvetica Neue",
    "Arial",
    "sans-serif",
  ],
});
