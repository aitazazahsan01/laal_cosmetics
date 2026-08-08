/**
 * Site-wide constants.
 *
 * Anything LAAL has not supplied yet is marked TODO and must not be replaced with an
 * invented value.
 */

export const SITE = {
  name: "LAAL",
  legalName: "LAAL Cosmetics",
  domain: "laalcosmetics.com",
  url: "https://laalcosmetics.com",
  city: "Islamabad, Pakistan",
  /** Real, from the LAAL Website Content Pack §3. */
  address: "Building 67, Square Commercial, Bahria Town Phase 7, Islamabad",
  /** Real, from LAAL's approved packaging copy. */
  tagline: "Every ingredient printed. Every active named.",
  /** Real, from the Phase A approved design. */
  footerBlurb:
    "Two face serums, made and tested in Pakistan. Every active named, every batch traceable.",
} as const;

/**
 * Real WhatsApp Business number, from the LAAL Website Content Pack §3 (local format
 * "0328 5780220" converted to full international format, digits only).
 */
export const WHATSAPP_NUMBER = "923285780220";

export const WHATSAPP_CONFIGURED = /^\d{8,15}$/.test(WHATSAPP_NUMBER);

export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

/**
 * TODO(LAAL): contact email address not supplied yet.
 */
export const CONTACT_EMAIL: string | null = null;

/**
 * TODO(LAAL): Instagram handle to be supplied — leave the icon in place and link it later
 * (content pack §13.1). Null renders the icon inert, the same "pending" pattern as WhatsApp
 * and email above.
 */
export const INSTAGRAM_URL: string | null = null;

/** Primary navigation. Every route here is built. */
export const PRIMARY_NAV = [
  { label: "Niacinamide+", href: "/niacinamide" },
  { label: "Hyaluronic+", href: "/hyaluronic" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Ingredients", href: "/ingredients" },
  { label: "Stockists", href: "/stockists" },
  { label: "Contact", href: "/contact" },
] as const;

export const FOOTER_NAV = [
  {
    heading: "Shop",
    links: [
      { label: "Niacinamide+", href: "/niacinamide" },
      { label: "Hyaluronic+", href: "/hyaluronic" },
      { label: "Shop both", href: "/shop" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Ingredients", href: "/ingredients" },
      { label: "Stockists", href: "/stockists" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Policies",
    links: [
      { label: "Shipping", href: "/shipping" },
      { label: "Returns", href: "/returns" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
] as const;

/** Consistent wording for the pending treatment, so it reads the same everywhere. */
export const PENDING_LABEL = "Pending — LAAL to supply";

/** Pakistan's provinces and territories, for the checkout address. */
export const PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Gilgit-Baltistan",
  "Azad Kashmir",
] as const;

/**
 * Payment account details for the three non-COD methods.
 *
 * Easypaisa's account number is real, from the LAAL Website Content Pack §3. The account
 * title, and every JazzCash/bank transfer field, have not been supplied and stay null on
 * purpose so they render a <PendingNote> at checkout — account numbers and IBANs are never
 * guessed or placeholdered with plausible-looking digits, because a customer could actually
 * send money to them.
 */
export const PAYMENT_ACCOUNTS: Record<
  "EASYPAISA" | "JAZZCASH" | "BANK_TRANSFER",
  { label: string; fields: { label: string; value: string | null }[] }
> = {
  EASYPAISA: {
    label: "Easypaisa",
    fields: [
      { label: "Account title", value: null },
      { label: "Account number", value: "0328-5780220" },
    ],
  },
  JAZZCASH: {
    label: "JazzCash",
    fields: [
      { label: "Account title", value: null },
      { label: "Account number", value: null },
    ],
  },
  BANK_TRANSFER: {
    label: "Bank transfer",
    fields: [
      { label: "Bank", value: null },
      { label: "Account title", value: null },
      { label: "IBAN", value: null },
    ],
  },
};

/**
 * Shown wherever a total appears while LAAL's real prices are outstanding.
 * See lib/pricing.ts for why nulls are treated as Rs. 0.
 */
export const DEMO_PRICING_NOTE =
  "Demo pricing shown — totals will reflect LAAL's real prices once supplied.";
