import type { Product } from "@prisma/client";

/**
 * Ingredient analysis, derived from the seeded INCI lists rather than hardcoded.
 *
 * Everything here is computed from `Product.inciList`, which is verbatim from LAAL's approved
 * box artwork. That matters for the About page's "what's never in a LAAL bottle" block: the
 * claim is only rendered when the code has actually confirmed the ingredient is absent from
 * every product's list. If LAAL ever reformulates and adds a fragrance, the claim disappears
 * on its own instead of quietly becoming false.
 *
 * Naming which INCI entries are "actives" is a structural editorial decision, not a claim
 * about what they do — what each one does stays a <PendingNote> until LAAL supplies it.
 */

/** Splits an INCI string into normalised ingredient names. */
export function parseInci(inciList: string): string[] {
  return inciList
    .replace(/\.\s*$/, "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function normalise(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/* ------------------------------------------------------------------ *
 * Exclusions — "what's never in a LAAL bottle"
 * ------------------------------------------------------------------ */

export type Exclusion = {
  label: string;
  basis: string;
  /** False means the substance WAS found, so the claim must not be shown. */
  verified: boolean;
};

/**
 * INCI substrings that would indicate an added fragrance or an added colourant.
 * "Parfum"/"Aroma" are the INCI terms; CI numbers (e.g. "CI 19140") are colourants.
 */
const FRAGRANCE_MARKERS = ["parfum", "fragrance", "aroma"];
const COLOURANT_MARKERS = ["ci1", "ci2", "ci4", "ci5", "ci6", "ci7", "colorant", "colourant"];

function containsMarker(products: Product[], markers: string[]): boolean {
  return products.some((product) =>
    parseInci(product.inciList).some((ingredient) => {
      const flat = normalise(ingredient);
      return markers.some((marker) => flat.includes(marker));
    }),
  );
}

export function deriveExclusions(products: Product[]): Exclusion[] {
  const basis =
    products.length > 1
      ? "Checked against both full INCI lists"
      : "Checked against the full INCI list";

  return [
    {
      label: "No added fragrance",
      basis,
      verified: !containsMarker(products, FRAGRANCE_MARKERS),
    },
    {
      label: "No added dye or colourant",
      basis,
      verified: !containsMarker(products, COLOURANT_MARKERS),
    },
    {
      // Not an INCI check — a standing brand/site rule from the SRS.
      label: "No fairness or whitening agents",
      basis: "Site-wide rule, SRS §8",
      verified: true,
    },
  ];
}

/* ------------------------------------------------------------------ *
 * Actives
 * ------------------------------------------------------------------ */

/**
 * The INCI entries LAAL presents as actives, with the common names used on the boxes.
 * Presence and concentration are both read from the product data below, never assumed.
 */
const ACTIVE_INCI: { inci: string; commonName?: string }[] = [
  { inci: "Niacinamide" },
  { inci: "Zinc PCA" },
  { inci: "Sodium Hyaluronate", commonName: "Hyaluronic Acid" },
  { inci: "D-Panthenol", commonName: "B5" },
  { inci: "Tocopheryl Acetate", commonName: "Vitamin E" },
  { inci: "Pyridoxine", commonName: "B6" },
  { inci: "Allantoin" },
];

export type ActiveOccurrence = {
  productName: string;
  productSlug: string;
  /** e.g. "5%" when the box states a concentration for this active. */
  concentration: string | null;
};

export type DerivedActive = {
  inci: string;
  commonName?: string;
  displayName: string;
  occurrences: ActiveOccurrence[];
};

/**
 * Reads a stated concentration for an ingredient out of a product's actives line,
 * e.g. "Niacinamide 5% · Zinc PCA 0.5%" → "5%" for Niacinamide.
 */
function concentrationFor(activesLine: string, inci: string): string | null {
  for (const segment of activesLine.split("·")) {
    const trimmed = segment.trim();
    if (!normalise(trimmed).startsWith(normalise(inci))) continue;
    const match = trimmed.match(/(\d+(?:\.\d+)?\s*%)/);
    if (match) return match[1].replace(/\s+/g, "");
  }
  return null;
}

/** Every active present in at least one product, in the order the boxes list them. */
export function deriveActives(products: Product[]): DerivedActive[] {
  const actives: DerivedActive[] = [];

  for (const { inci, commonName } of ACTIVE_INCI) {
    const occurrences: ActiveOccurrence[] = [];

    for (const product of products) {
      const present = parseInci(product.inciList).some(
        (ingredient) => normalise(ingredient) === normalise(inci),
      );
      if (!present) continue;

      occurrences.push({
        productName: product.name,
        productSlug: product.slug,
        concentration: concentrationFor(product.activesLine, inci),
      });
    }

    if (occurrences.length === 0) continue;

    actives.push({
      inci,
      commonName,
      displayName: commonName ? `${inci} (${commonName})` : inci,
      occurrences,
    });
  }

  return actives;
}

/** "Niacinamide+ 5% · also present in Hyaluronic+" */
export function formatOccurrences(active: DerivedActive): string {
  const [first, ...rest] = active.occurrences;
  const head = first.concentration
    ? `${first.productName} ${first.concentration}`
    : first.productName;

  if (rest.length === 0) return head;
  return `${head} · also present in ${rest.map((o) => o.productName).join(", ")}`;
}
