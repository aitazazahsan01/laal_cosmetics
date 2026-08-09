import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCartView } from "@/lib/cart";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Guest checkout — no account needed.",
};

/**
 * Checkout.
 *
 * Server component: it prices the cart, then hands a read-only snapshot to the client form
 * purely for display. The submitted form contains no money values at all.
 */
export default async function CheckoutPage() {
  // COD is the default selection, so the preview total matches what a customer sees first.
  const cart = await getCartView("COD");

  if (cart.isEmpty) redirect("/cart");

  return (
    <main className="shell-narrow">
      <div className="pb-7 pt-9">
        <span className="label">Step 2 of 2</span>
        <h1 className="mt-2 font-serif text-[clamp(1.7rem,3.4vw,2.2rem)]">
          Checkout
        </h1>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-[0.9rem] text-muted">
          No account needed.
          <span className="rounded-full bg-ruby/[0.07] px-[0.7rem] py-[0.35rem] text-[0.78rem] text-ruby">
            Guest checkout
          </span>
        </p>
      </div>

      <CheckoutForm
        lines={cart.lines}
        totals={cart.totals}
        provisionalPricing={cart.provisionalPricing}
        discountCode={cart.discountCode}
        freeDeliveryThresholdRs={cart.freeDeliveryThresholdRs}
      />
    </main>
  );
}
