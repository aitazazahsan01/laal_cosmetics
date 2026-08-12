import type { Prisma } from "@prisma/client";

import { validateDiscountCode } from "@/lib/discounts";
import { sendOrderNotificationEmail, type OrderWithItems } from "@/lib/email";
import { computeTotals, type PricedLine } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";
import type { PaymentMethod } from "@/lib/types";

/**
 * Order creation.
 *
 * SECURITY — nothing about money or stock is taken from the client. The caller passes item
 * slugs and quantities; prices, delivery, discount and the total are all read from the
 * database inside the transaction and recomputed here. The figures the browser displayed are
 * a preview only and are never sent, let alone trusted.
 *
 * CONCURRENCY — the stock check and the decrement are one atomic step. Rather than
 * "read stock, compare, then write" (which two near-simultaneous orders can both pass), the
 * decrement is a conditional update guarded on `stockQty >= quantity`; if it affects zero
 * rows another order got there first and the whole transaction rolls back. No partial order
 * is ever written.
 */

export type CreateOrderInput = {
  items: { slug: string; quantity: number }[];
  discountCode?: string | null;
  customerName: string;
  customerWhatsapp: string;
  customerEmail?: string | null;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  province: string;
  postalCode?: string | null;
  notes?: string | null;
  paymentMethod: PaymentMethod;
  paymentScreenshotUrl?: string | null;
};

export type CreateOrderResult =
  | { ok: true; orderNumber: string }
  | { ok: false; error: string };

/** Sequential, human-readable, per calendar year: LAAL-2026-0001. */
async function nextOrderNumber(tx: Prisma.TransactionClient): Promise<string> {
  const prefix = `LAAL-${new Date().getFullYear()}-`;

  const latest = await tx.order.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });

  const lastSequence = latest
    ? Number.parseInt(latest.orderNumber.slice(prefix.length), 10)
    : 0;

  const next = Number.isFinite(lastSequence) ? lastSequence + 1 : 1;
  return `${prefix}${String(next).padStart(4, "0")}`;
}

export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  const requested = input.items.filter((item) => item.quantity > 0);
  if (requested.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }

  let created: OrderWithItems;

  try {
    created = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { slug: { in: requested.map((item) => item.slug) }, isActive: true },
      });
      const bySlug = new Map(products.map((product) => [product.slug, product]));

      // Build priced lines from database rows only.
      const lines: PricedLine[] = [];
      for (const item of requested) {
        const product = bySlug.get(item.slug);
        if (!product) {
          throw new OrderError(`${item.slug} is no longer available.`);
        }
        if (product.stockQty < item.quantity) {
          throw new OrderError(
            product.stockQty === 0
              ? `${product.name} has just sold out.`
              : `Only ${product.stockQty} of ${product.name} ${product.stockQty === 1 ? "is" : "are"} left.`,
          );
        }

        const unitPriceRs = product.priceRs ?? 0;
        lines.push({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          tagline: product.tagline,
          activesLine: product.activesLine,
          sizeMl: product.sizeMl,
          imageUrl: null, // Not rendered on this path — OrderSummary is text-only.
          quantity: item.quantity,
          unitPriceRs,
          priceSupplied: product.priceRs !== null,
          lineTotalRs: unitPriceRs * item.quantity,
          stockQty: product.stockQty,
        });
      }

      const delivery = await tx.deliverySettings.findUnique({
        where: { id: "default" },
      });

      const subtotalRs = lines.reduce((sum, line) => sum + line.lineTotalRs, 0);

      // Re-validate the discount inside the transaction so the redemption-limit check and
      // the increment below cannot interleave with a competing order.
      let discountRs = 0;
      let discountCodeId: string | null = null;
      if (input.discountCode) {
        const result = await validateDiscountCode(input.discountCode, subtotalRs, tx);
        if (result.ok) {
          discountRs = result.discountRs;
          discountCodeId = result.code.id;
        }
        // An invalid code is silently ignored rather than blocking the order; the cart already
        // showed the customer that it did not apply.
      }

      const totals = computeTotals({
        lines,
        delivery,
        discountRs,
        paymentMethod: input.paymentMethod,
      });

      // Atomic check-and-decrement. Zero affected rows means someone else took the stock.
      for (const line of lines) {
        const result = await tx.product.updateMany({
          where: { id: line.productId, stockQty: { gte: line.quantity } },
          data: { stockQty: { decrement: line.quantity } },
        });
        if (result.count !== 1) {
          throw new OrderError(
            `${line.name} sold out while you were checking out. Nothing has been ordered.`,
          );
        }
      }

      if (discountCodeId) {
        await tx.discountCode.update({
          where: { id: discountCodeId },
          data: { timesRedeemed: { increment: 1 } },
        });
      }

      const orderNumber = await nextOrderNumber(tx);

      return tx.order.create({
        data: {
          orderNumber,
          customerName: input.customerName,
          customerWhatsapp: input.customerWhatsapp,
          customerEmail: input.customerEmail || null,
          addressLine1: input.addressLine1,
          addressLine2: input.addressLine2 || null,
          city: input.city,
          province: input.province,
          postalCode: input.postalCode || null,
          notes: input.notes || null,
          subtotalRs: totals.subtotalRs,
          deliveryFeeRs: totals.deliveryFeeRs,
          discountRs: totals.discountRs,
          totalRs: totals.totalRs,
          discountCodeId,
          paymentMethod: input.paymentMethod,
          paymentScreenshotUrl: input.paymentScreenshotUrl || null,
          status: "PENDING_PAYMENT",
          items: {
            create: lines.map((line) => ({
              productId: line.productId,
              productSlug: line.slug,
              productName: line.name,
              unitPriceRs: line.unitPriceRs,
              quantity: line.quantity,
              lineTotalRs: line.lineTotalRs,
            })),
          },
        },
        include: { items: true },
      });
    }, { timeout: 20000 });
    // ^ Prisma's interactive-transaction default is 5000ms. This transaction is several
    // sequential round trips (product lookup, delivery settings, a per-line stock
    // decrement, discount redemption, order-number lookup, then the order insert itself),
    // and each round trip pays the network latency to Supabase's pooler — comfortably
    // exceeds 5s in practice, especially from outside the database's own region, so the
    // whole order was rolling back right before the final insert. 20s gives real headroom
    // without masking a truly stuck query.
  } catch (error) {
    if (error instanceof OrderError) {
      return { ok: false, error: error.message };
    }
    console.error("[orders] order creation failed:", error);
    return {
      ok: false,
      error: "Something went wrong placing your order. Nothing has been charged — please try again.",
    };
  }

  // Fire-and-forget: a notification failure must never invalidate a committed order.
  try {
    await sendOrderNotificationEmail(created);
  } catch (error) {
    console.error("[orders] notification failed (order is still valid):", error);
  }

  return { ok: true, orderNumber: created.orderNumber };
}

/** Errors safe to show the customer verbatim. Anything else is logged and generalised. */
class OrderError extends Error {}

export async function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });
}
