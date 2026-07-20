import { cookies } from "next/headers";

import { validateDiscountCode } from "@/lib/discounts";
import {
  computeTotals,
  pricingIsProvisional,
  type PricedLine,
  type Totals,
} from "@/lib/pricing";
import { prisma } from "@/lib/prisma";
import type { PaymentMethod } from "@/lib/types";

/**
 * Cart storage.
 *
 * The cart lives in an httpOnly cookie rather than localStorage (F-01/F-02: it must survive a
 * refresh for a guest with no account). A cookie is readable during server rendering, so the
 * cart page, the checkout summary and the header count all render correct on first paint with
 * no loading flash and no hydration mismatch.
 *
 * The cookie holds ONLY slugs, quantities and a discount code string — never prices. Every
 * figure is recomputed from the database, so tampering with the cookie cannot change what a
 * customer is charged.
 */

const CART_COOKIE = "laal_cart";
const MAX_QTY_PER_LINE = 20;
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export type CartCookie = {
  items: { slug: string; qty: number }[];
  discountCode?: string | null;
};

/**
 * Always a FRESH object.
 *
 * This must never be a shared module-level constant. Callers mutate what readCart() returns
 * (`cart.items.push(...)` in the cart actions), and a shared empty-cart object would be
 * mutated in place — permanently, for the lifetime of the server process. Every later visitor
 * arriving without a cart cookie would then inherit a previous visitor's items.
 */
function emptyCart(): CartCookie {
  return { items: [], discountCode: null };
}

function sanitise(raw: unknown): CartCookie {
  if (!raw || typeof raw !== "object") return emptyCart();

  const source = raw as Partial<CartCookie>;
  const items = Array.isArray(source.items) ? source.items : [];

  const cleaned = items
    .filter(
      (item): item is { slug: string; qty: number } =>
        !!item &&
        typeof item.slug === "string" &&
        typeof item.qty === "number" &&
        Number.isFinite(item.qty),
    )
    .map((item) => ({
      slug: item.slug.slice(0, 64),
      qty: Math.min(Math.max(Math.trunc(item.qty), 1), MAX_QTY_PER_LINE),
    }));

  // Collapse any duplicate slugs a hand-edited cookie might contain.
  const merged = new Map<string, number>();
  for (const item of cleaned) {
    merged.set(item.slug, Math.min((merged.get(item.slug) ?? 0) + item.qty, MAX_QTY_PER_LINE));
  }

  return {
    items: [...merged].map(([slug, qty]) => ({ slug, qty })),
    discountCode:
      typeof source.discountCode === "string" && source.discountCode.trim()
        ? source.discountCode.trim().toUpperCase().slice(0, 64)
        : null,
  };
}

export async function readCart(): Promise<CartCookie> {
  const store = await cookies();
  const raw = store.get(CART_COOKIE)?.value;
  if (!raw) return emptyCart();
  try {
    return sanitise(JSON.parse(raw));
  } catch {
    return emptyCart();
  }
}

/** Only callable from a server action or route handler — Next forbids writing cookies during render. */
export async function writeCart(cart: CartCookie): Promise<void> {
  const store = await cookies();
  const clean = sanitise(cart);

  if (clean.items.length === 0 && !clean.discountCode) {
    store.delete(CART_COOKIE);
    return;
  }

  store.set(CART_COOKIE, JSON.stringify(clean), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

export async function clearCart(): Promise<void> {
  const store = await cookies();
  store.delete(CART_COOKIE);
}

export type CartView = {
  lines: PricedLine[];
  totals: Totals;
  itemCount: number;
  isEmpty: boolean;
  provisionalPricing: boolean;
  discountCode: string | null;
  /** Set when a stored code no longer validates, so the cart can explain why nothing applied. */
  discountError: string | null;
  /** Lines whose requested quantity now exceeds live stock. */
  stockProblems: { slug: string; name: string; requested: number; available: number }[];
};

/**
 * Resolves the cookie into a fully priced cart, reading products and settings from the
 * database. Quantities are clamped to live stock so the cart never shows an unbuyable line.
 */
export async function getCartView(
  paymentMethod?: PaymentMethod,
): Promise<CartView> {
  const cart = await readCart();

  if (cart.items.length === 0) {
    return {
      lines: [],
      totals: { subtotalRs: 0, deliveryFeeRs: 0, discountRs: 0, totalRs: 0 },
      itemCount: 0,
      isEmpty: true,
      provisionalPricing: false,
      discountCode: cart.discountCode ?? null,
      discountError: null,
      stockProblems: [],
    };
  }

  const [products, delivery] = await Promise.all([
    prisma.product.findMany({
      where: { slug: { in: cart.items.map((item) => item.slug) }, isActive: true },
    }),
    prisma.deliverySettings.findUnique({ where: { id: "default" } }),
  ]);

  const bySlug = new Map(products.map((product) => [product.slug, product]));
  const stockProblems: CartView["stockProblems"] = [];

  const lines: PricedLine[] = [];
  for (const item of cart.items) {
    const product = bySlug.get(item.slug);
    if (!product) continue; // Product withdrawn since it was added — drop it silently.

    const quantity = Math.min(item.qty, product.stockQty);
    if (quantity < item.qty) {
      stockProblems.push({
        slug: product.slug,
        name: product.name,
        requested: item.qty,
        available: product.stockQty,
      });
    }
    if (quantity <= 0) continue;

    const unitPriceRs = product.priceRs ?? 0;
    lines.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      tagline: product.tagline,
      activesLine: product.activesLine,
      sizeMl: product.sizeMl,
      quantity,
      unitPriceRs,
      priceSupplied: product.priceRs !== null,
      lineTotalRs: unitPriceRs * quantity,
      stockQty: product.stockQty,
    });
  }

  const subtotalRs = lines.reduce((sum, line) => sum + line.lineTotalRs, 0);

  let discountRs = 0;
  let discountError: string | null = null;
  if (cart.discountCode) {
    const result = await validateDiscountCode(cart.discountCode, subtotalRs);
    if (result.ok) {
      discountRs = result.discountRs;
    } else {
      discountError = result.reason;
    }
  }

  const totals = computeTotals({ lines, delivery, discountRs, paymentMethod });

  return {
    lines,
    totals,
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    isEmpty: lines.length === 0,
    provisionalPricing: pricingIsProvisional(lines, delivery),
    discountCode: cart.discountCode ?? null,
    discountError,
    stockProblems,
  };
}

/** Lightweight count for the header badge — avoids pricing the whole cart on every page. */
export async function getCartItemCount(): Promise<number> {
  const cart = await readCart();
  return cart.items.reduce((sum, item) => sum + item.qty, 0);
}

export { MAX_QTY_PER_LINE };
