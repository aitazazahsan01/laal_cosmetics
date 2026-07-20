import type { ReactNode } from "react";

import { formatRsExact, type PricedLine, type Totals } from "@/lib/pricing";
import { DemoPricingNote } from "@/components/cart/DemoPricingNote";

/**
 * The order summary panel, shared by the cart and the checkout so the two can never disagree
 * about how a total is presented.
 *
 * Every figure here is computed server-side in lib/pricing.ts. This component only formats.
 */
export function OrderSummary({
  lines,
  totals,
  provisionalPricing,
  showLineItems = false,
  discountCode,
  children,
}: {
  lines: PricedLine[];
  totals: Totals;
  provisionalPricing: boolean;
  showLineItems?: boolean;
  discountCode?: string | null;
  children?: ReactNode;
}) {
  return (
    <aside className="rounded-panel border border-line bg-blush p-7 lg:sticky lg:top-24">
      <h2 className="font-serif text-[1.1rem]">Order summary</h2>

      {showLineItems
        ? lines.map((line) => (
            <div
              key={line.slug}
              className="mt-[0.9rem] flex justify-between gap-4 text-[0.86rem]"
            >
              <span>
                {line.quantity} × {line.name}{" "}
                <span className="text-muted">{line.sizeMl} ml</span>
              </span>
              <span className="tabular-nums">
                {formatRsExact(line.lineTotalRs)}
              </span>
            </div>
          ))
        : null}

      <div className="mt-4 flex justify-between border-t border-dashed border-line pt-4 text-[0.92rem]">
        <span>Subtotal</span>
        <span className="tabular-nums">{formatRsExact(totals.subtotalRs)}</span>
      </div>

      {totals.discountRs > 0 ? (
        <div className="mt-[0.9rem] flex justify-between text-[0.92rem] text-ruby">
          <span>Discount{discountCode ? ` (${discountCode})` : ""}</span>
          <span className="tabular-nums">
            −{formatRsExact(totals.discountRs)}
          </span>
        </div>
      ) : null}

      <div className="mt-[0.9rem] flex justify-between text-[0.92rem]">
        <span>Delivery</span>
        <span className="tabular-nums">
          {formatRsExact(totals.deliveryFeeRs)}
        </span>
      </div>

      <div className="mt-4 flex justify-between border-t border-line pt-4 font-serif text-[1.1rem] text-oxblood">
        <span>Total</span>
        <span className="tabular-nums">{formatRsExact(totals.totalRs)}</span>
      </div>

      {provisionalPricing ? <DemoPricingNote className="mt-4" /> : null}

      {children}
    </aside>
  );
}

export default OrderSummary;
