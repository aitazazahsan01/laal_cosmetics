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
  /** Real, from LAAL's approved packaging copy. */
  tagline: "Every ingredient printed. Every active named.",
  /** Real, from the Phase A approved design. */
  footerBlurb:
    "Two face serums, made and tested in Pakistan. Every active named, every batch traceable.",
} as const;

/**
 * TODO(LAAL): replace with the real WhatsApp Business number, full international format,
 * digits only, no "+" or spaces — e.g. "923001234567".
 *
 * Until it is supplied this placeholder deliberately produces an invalid wa.me link rather
 * than dialling an unrelated real number. `WHATSAPP_CONFIGURED` is false while it is unset,
 * so the UI can flag the number as pending.
 */
export const WHATSAPP_NUMBER = "92XXXXXXXXXX";

export const WHATSAPP_CONFIGURED = /^\d{8,15}$/.test(WHATSAPP_NUMBER);

export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

/**
 * TODO(LAAL): contact email address not supplied yet.
 */
export const CONTACT_EMAIL: string | null = null;

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
 * TODO(LAAL): none of these have been supplied. Every field is null on purpose and renders a
 * <PendingNote> at checkout — account numbers and IBANs are never guessed or placeholdered
 * with plausible-looking digits, because a customer could actually send money to them.
 */
export const PAYMENT_ACCOUNTS: Record<
  "EASYPAISA" | "JAZZCASH" | "BANK_TRANSFER",
  { label: string; fields: { label: string; value: string | null }[] }
> = {
  EASYPAISA: {
    label: "Easypaisa",
    fields: [
      { label: "Account title", value: null },
      { label: "Account number", value: null },
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
