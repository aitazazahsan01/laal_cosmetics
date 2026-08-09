import type { Product } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { FaqEntry, StockStatus, TimelineEntry } from "@/lib/types";

/**
 * Read helpers for the catalogue.
 *
 * Two things happen here and nowhere else:
 *  1. Stock status is DERIVED from stockQty (it is never stored on the row).
 *  2. The JSON-encoded String columns are parsed into typed arrays.
 */

function parseJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    const parsed: unknown = JSON.parse(value);
    return (parsed ?? fallback) as T;
  } catch {
    // Malformed content is treated as "not supplied" rather than crashing the page.
    return fallback;
  }
}

export function productStockStatus(stockQty: number): StockStatus {
  return stockQty > 0 ? "IN_STOCK" : "SOLD_OUT";
}

export function stockStatusLabel(status: StockStatus): string {
  return status === "IN_STOCK" ? "In stock" : "Sold out";
}

/** A Product row with derived status and parsed JSON content, ready for rendering. */
export type ProductView = Omit<
  Product,
  | "whatItDoes"
  | "timelineByWeek"
  | "howToUseAM"
  | "howToUsePM"
  | "faq"
  | "imageUrls"
> & {
  whatItDoes: string[];
  timelineByWeek: TimelineEntry[];
  howToUseAM: string[];
  howToUsePM: string[];
  faq: FaqEntry[];
  imageUrls: string[];
  stockStatus: StockStatus;
  stockLabel: string;
  inStock: boolean;
  /** True when LAAL has supplied a price. */
  hasPrice: boolean;
};

export function toProductView(product: Product): ProductView {
  const stockStatus = productStockStatus(product.stockQty);

  return {
    ...product,
    whatItDoes: parseJson<string[]>(product.whatItDoes, []),
    timelineByWeek: parseJson<TimelineEntry[]>(product.timelineByWeek, []),
    howToUseAM: parseJson<string[]>(product.howToUseAM, []),
    howToUsePM: parseJson<string[]>(product.howToUsePM, []),
    faq: parseJson<FaqEntry[]>(product.faq, []),
    imageUrls: parseJson<string[]>(product.imageUrls, []),
    stockStatus,
    stockLabel: stockStatusLabel(stockStatus),
    inStock: stockStatus === "IN_STOCK",
    hasPrice: product.priceRs !== null,
  };
}

export async function getProducts(): Promise<ProductView[]> {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return products.map(toProductView);
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductView | null> {
  const product = await prisma.product.findUnique({ where: { slug } });
  return product ? toProductView(product) : null;
}

/** Used by the wishlist page, where the slug list comes from the client's localStorage. */
export async function getProductsBySlugs(slugs: string[]): Promise<ProductView[]> {
  if (slugs.length === 0) return [];
  const products = await prisma.product.findMany({
    where: { slug: { in: slugs }, isActive: true },
  });
  const views = products.map(toProductView);
  // Preserve the caller's order (most-recently-saved-first from the wishlist) rather than
  // whatever order the database happens to return.
  const bySlug = new Map(views.map((view) => [view.slug, view]));
  return slugs.map((slug) => bySlug.get(slug)).filter((v): v is ProductView => Boolean(v));
}

export async function getDeliverySettings() {
  return prisma.deliverySettings.findUnique({ where: { id: "default" } });
}

/** Formats whole rupees for display. Returns null when no price has been supplied. */
export function formatRs(priceRs: number | null): string | null {
  if (priceRs === null) return null;
  return `Rs. ${priceRs.toLocaleString("en-PK")}`;
}

/**
 * Splits a product name such as "Niacinamide+" so the trailing "+" can be rendered in ruby,
 * per the brand rule that the "+" in product names is always an accent.
 */
export function splitProductName(name: string): { base: string; plus: string } {
  return name.endsWith("+")
    ? { base: name.slice(0, -1), plus: "+" }
    : { base: name, plus: "" };
}
