"use server";

import { getProductsBySlugs, type ProductView } from "@/lib/products";

/**
 * Fetches full product data for a client-supplied list of slugs (the wishlist page's slugs
 * come from localStorage, so the server has no other way to know them). Read-only, and goes
 * through the same isActive-filtered query as the rest of the catalogue — a withdrawn product
 * that's still in someone's saved list simply won't come back.
 */
export async function getWishlistProductsAction(slugs: string[]): Promise<ProductView[]> {
  const cleaned = slugs
    .filter((slug): slug is string => typeof slug === "string")
    .map((slug) => slug.trim())
    .filter(Boolean)
    .slice(0, 50);
  return getProductsBySlugs(cleaned);
}
