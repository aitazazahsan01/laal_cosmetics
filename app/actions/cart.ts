"use server";

import { revalidatePath } from "next/cache";

import { MAX_QTY_PER_LINE, readCart, writeCart } from "@/lib/cart";
import { validateDiscountCode } from "@/lib/discounts";
import { prisma } from "@/lib/prisma";

/**
 * Cart mutations.
 *
 * All of these run on the server and write the httpOnly cart cookie, which is the only place
 * cart state lives. Nothing here accepts a price — the client can only ask for "one more of
 * this slug"; what that costs is decided in lib/pricing.ts against the database.
 */

function refresh() {
  // The header badge lives in the root layout, so cart pages and product pages both need to
  // re-render after any change.
  revalidatePath("/", "layout");
}

/**
 * Adds one of each submitted slug.
 *
 * Reads every `slug` field rather than just the first, so the same action serves both a
 * single product card and the "The Pair" bundle, which submits two.
 */
export async function addToCartAction(formData: FormData): Promise<void> {
  const slugs = formData
    .getAll("slug")
    .map((value) => String(value).trim())
    .filter(Boolean);

  if (slugs.length === 0) return;

  // Only add things that actually exist and are purchasable.
  const products = await prisma.product.findMany({
    where: { slug: { in: slugs }, isActive: true },
    select: { slug: true, stockQty: true },
  });
  const bySlug = new Map(products.map((product) => [product.slug, product]));

  const cart = await readCart();

  for (const slug of slugs) {
    const product = bySlug.get(slug);
    if (!product || product.stockQty <= 0) continue;

    const existing = cart.items.find((item) => item.slug === slug);
    if (existing) {
      existing.qty = Math.min(
        existing.qty + 1,
        product.stockQty,
        MAX_QTY_PER_LINE,
      );
    } else {
      cart.items.push({ slug, qty: 1 });
    }
  }

  await writeCart(cart);
  refresh();
}

export async function setQuantityAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "").trim();
  const quantity = Number(formData.get("quantity"));
  if (!slug || !Number.isFinite(quantity)) return;

  const cart = await readCart();

  if (quantity <= 0) {
    cart.items = cart.items.filter((item) => item.slug !== slug);
  } else {
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { stockQty: true },
    });
    const ceiling = Math.min(product?.stockQty ?? 0, MAX_QTY_PER_LINE);
    const line = cart.items.find((item) => item.slug === slug);
    if (line) {
      line.qty = Math.max(Math.min(Math.trunc(quantity), ceiling), 1);
    }
  }

  await writeCart(cart);
  refresh();
}

export async function removeFromCartAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) return;

  const cart = await readCart();
  cart.items = cart.items.filter((item) => item.slug !== slug);
  await writeCart(cart);
  refresh();
}

export type DiscountFormState = { message: string | null; applied: boolean };

/**
 * Stores a discount code on the cart after validating it.
 *
 * No codes exist yet, so this currently always reports "That code isn't recognised" — the
 * honest result, and proof the validation path is real rather than stubbed.
 */
export async function applyDiscountAction(
  _prevState: DiscountFormState,
  formData: FormData,
): Promise<DiscountFormState> {
  const code = String(formData.get("code") ?? "").trim();

  if (!code) {
    const cart = await readCart();
    cart.discountCode = null;
    await writeCart(cart);
    refresh();
    return { message: null, applied: false };
  }

  // Validate against the current subtotal so minimum-spend rules are honoured.
  const cart = await readCart();
  const products = await prisma.product.findMany({
    where: { slug: { in: cart.items.map((item) => item.slug) } },
    select: { slug: true, priceRs: true },
  });
  const priceBySlug = new Map(products.map((p) => [p.slug, p.priceRs ?? 0]));
  const subtotalRs = cart.items.reduce(
    (sum, item) => sum + (priceBySlug.get(item.slug) ?? 0) * item.qty,
    0,
  );

  const result = await validateDiscountCode(code, subtotalRs);

  if (!result.ok) {
    cart.discountCode = null;
    await writeCart(cart);
    refresh();
    return { message: result.reason, applied: false };
  }

  cart.discountCode = result.code.code;
  await writeCart(cart);
  refresh();
  return { message: `${result.code.code} applied.`, applied: true };
}
