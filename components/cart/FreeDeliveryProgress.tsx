import { formatRsExact } from "@/lib/pricing";

/**
 * "Add Rs. X more for free delivery" progress bar, shown in the cart drawer and the cart/
 * checkout order summary.
 *
 * Renders nothing when `thresholdRs` is null — LAAL has not supplied a free-delivery threshold
 * yet, and there is nothing honest to show progress toward (see the DEMO PRICING note in
 * lib/pricing.ts). Once real, this is pure arithmetic against the real subtotal — no copy here
 * is written per-cart, so there is nothing to fabricate.
 */
export function FreeDeliveryProgress({
  subtotalRs,
  thresholdRs,
  className = "",
}: {
  subtotalRs: number;
  thresholdRs: number | null;
  className?: string;
}) {
  if (thresholdRs === null || thresholdRs <= 0) return null;

  const reached = subtotalRs >= thresholdRs;
  const percent = Math.min(100, Math.round((subtotalRs / thresholdRs) * 100));
  const remainingRs = thresholdRs - subtotalRs;

  const message = reached
    ? "You've unlocked free delivery."
    : `Add ${formatRsExact(remainingRs)} more for free delivery.`;

  return (
    <div className={className}>
      <p
        role="status"
        className={`text-[0.82rem] font-semibold ${reached ? "text-ruby" : "text-oxblood"}`}
      >
        {message}
      </p>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progress toward free delivery"
        className="mt-2 h-[5px] w-full overflow-hidden rounded-full bg-line"
      >
        <div
          className="h-full rounded-full bg-ruby transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default FreeDeliveryProgress;
