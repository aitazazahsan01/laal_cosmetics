import type { DiscountCode, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

/**
 * Discount code validation.
 *
 * There are no seeded codes — LAAL has not created any yet — so in practice every code
 * entered today comes back "not recognised". That is the honest and correct outcome, not a
 * gap to paper over: codes will be created through the admin panel in a later phase.
 */

export type DiscountResult =
  | { ok: true; code: DiscountCode; discountRs: number }
  | { ok: false; reason: string };

export function computeDiscountRs(
  code: Pick<DiscountCode, "type" | "value">,
  subtotalRs: number,
): number {
  if (code.type === "PERCENT") {
    return Math.floor((subtotalRs * Math.min(Math.max(code.value, 0), 100)) / 100);
  }
  return Math.min(Math.max(code.value, 0), subtotalRs);
}

/**
 * Validates a code against the database.
 *
 * Pass `tx` to run inside the order-creation transaction, so the redemption-limit check and
 * the increment that follows it cannot interleave with another order.
 */
export async function validateDiscountCode(
  rawCode: string,
  subtotalRs: number,
  tx: Prisma.TransactionClient | typeof prisma = prisma,
): Promise<DiscountResult> {
  const normalised = rawCode.trim().toUpperCase();
  if (!normalised) return { ok: false, reason: "Enter a discount code." };

  // Codes are stored uppercase; normalising both sides keeps the lookup case-insensitive
  // without relying on collation, which differs between SQLite and Postgres.
  const code = await tx.discountCode.findUnique({ where: { code: normalised } });

  if (!code) return { ok: false, reason: "That code isn't recognised." };
  if (!code.isActive) return { ok: false, reason: "That code is no longer active." };

  const now = new Date();
  if (code.startsAt && code.startsAt > now) {
    return { ok: false, reason: "That code isn't active yet." };
  }
  if (code.endsAt && code.endsAt < now) {
    return { ok: false, reason: "That code has expired." };
  }
  if (code.maxRedemptions !== null && code.timesRedeemed >= code.maxRedemptions) {
    return { ok: false, reason: "That code has reached its redemption limit." };
  }
  if (code.minSubtotalRs !== null && subtotalRs < code.minSubtotalRs) {
    return {
      ok: false,
      reason: `That code needs a subtotal of at least Rs. ${code.minSubtotalRs.toLocaleString("en-PK")}.`,
    };
  }

  return { ok: true, code, discountRs: computeDiscountRs(code, subtotalRs) };
}
