import type { DeliverySettings } from "@prisma/client";

import type { PaymentMethod } from "@/lib/types";

/**
 * Pricing — the single source of truth for every money calculation on the site.
 *
 * Both the cart/checkout previews and the authoritative server-side order creation call
 * `computeTotals`. Nothing else is allowed to add money up, so a client can never influence
 * a total: the browser posts item slugs and quantities, never prices.
 *
 * DEMO PRICING
 * ------------
 * LAAL has not supplied product prices, the delivery fee, the free-delivery threshold or the
 * COD surcharge yet, so every one of those columns is currently null. Rather than blocking
 * the whole order flow (or inventing numbers), nulls are treated as Rs. 0 so the flow is
 * fully testable end to end, and `pricingIsProvisional()` drives a visible banner wherever a
 * total appears. This is a stated demo-state limitation, not fabricated data.
 */

export type PricedLine = {
  productId: string;
  slug: string;
  name: string;
  tagline: string;
  activesLine: string;
  sizeMl: number;
  quantity: number;
  /** 0 when LAAL has not supplied a price — see `priceSupplied`. */
  unitPriceRs: number;
  priceSupplied: boolean;
  lineTotalRs: number;
  /** Live stock, used for cart-time warnings and the authoritative check at order time. */
  stockQty: number;
};

export type Totals = {
  subtotalRs: number;
  deliveryFeeRs: number;
  discountRs: number;
  totalRs: number;
};

export function computeTotals({
  lines,
  delivery,
  discountRs = 0,
  paymentMethod,
}: {
  lines: PricedLine[];
  delivery: DeliverySettings | null;
  discountRs?: number;
  paymentMethod?: PaymentMethod;
}): Totals {
  const subtotalRs = lines.reduce((sum, line) => sum + line.lineTotalRs, 0);

  // Null fee means "not supplied yet" and is treated as 0 for the demo flow.
  let deliveryFeeRs = delivery?.standardFeeRs ?? 0;

  const threshold = delivery?.freeDeliveryThresholdRs;
  if (threshold !== null && threshold !== undefined && subtotalRs >= threshold) {
    deliveryFeeRs = 0;
  }

  if (paymentMethod === "COD") {
    deliveryFeeRs += delivery?.codSurchargeRs ?? 0;
  }

  // A discount can never exceed the subtotal, and a total can never go negative.
  const cappedDiscount = Math.min(Math.max(discountRs, 0), subtotalRs);
  const totalRs = Math.max(subtotalRs - cappedDiscount + deliveryFeeRs, 0);

  return {
    subtotalRs,
    deliveryFeeRs,
    discountRs: cappedDiscount,
    totalRs,
  };
}

/** True when any figure in the calculation is a stand-in rather than a real LAAL number. */
export function pricingIsProvisional(
  lines: PricedLine[],
  delivery: DeliverySettings | null,
): boolean {
  const anyPriceMissing = lines.some((line) => !line.priceSupplied);
  const deliveryMissing = (delivery?.standardFeeRs ?? null) === null;
  return anyPriceMissing || deliveryMissing;
}

/** Always renders a figure, including Rs. 0. Use `formatRs` when null must stay visible. */
export function formatRsExact(amountRs: number): string {
  return `Rs. ${amountRs.toLocaleString("en-PK")}`;
}
