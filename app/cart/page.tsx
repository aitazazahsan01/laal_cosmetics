import type { Metadata } from "next";
import Link from "next/link";

import { getCartView } from "@/lib/cart";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { DiscountForm } from "@/components/cart/DiscountForm";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { ButtonLink } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cart",
  description: "Your LAAL cart.",
};

/**
 * Cart (F-01, F-02).
 *
 * The cart is read from the httpOnly cookie and re-priced against the database on every
 * render, so it survives a refresh, a closed tab and a new session without an account.
 */
export default async function CartPage() {
  const cart = await getCartView();

  return (
    <main className="shell-narrow">
      <div className="pb-8 pt-10">
        <span className="label">Cart</span>
        <h1 className="mt-2 font-serif text-[clamp(1.8rem,3.6vw,2.4rem)]">
          Your cart
        </h1>
        <p className="mt-2 text-[0.92rem] text-muted">
          Saved automatically — safe to close this tab and come back.
        </p>
      </div>

      {cart.isEmpty ? (
        <div className="border-t border-line py-16">
          <h2 className="font-serif text-[1.3rem]">Your cart is empty.</h2>
          <p className="mt-3 max-w-[46ch] text-[0.95rem] text-muted">
            Both serums list every ingredient on their product page, so you can
            check the formula before you add anything.
          </p>
          <div className="mt-7 flex flex-wrap gap-4">
            <ButtonLink href="/shop">Shop the serums</ButtonLink>
            <ButtonLink href="/" variant="secondary">
              Back to home
            </ButtonLink>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-10 pb-20 lg:grid-cols-[1.6fr_1fr] lg:items-start">
          <div className="border-t border-line">
            {cart.stockProblems.length > 0 ? (
              <div
                role="status"
                className="mt-6 rounded-card border border-ruby bg-ruby/[0.05] px-4 py-3 text-[0.85rem] text-ruby"
              >
                {cart.stockProblems.map((problem) => (
                  <p key={problem.slug}>
                    Only {problem.available} of {problem.name}{" "}
                    {problem.available === 1 ? "is" : "are"} in stock — your
                    quantity has been adjusted.
                  </p>
                ))}
              </div>
            ) : null}

            {cart.lines.map((line) => (
              <CartLineItem key={line.slug} line={line} />
            ))}

            <Link
              href="/shop"
              className="mt-6 inline-block text-[0.85rem] font-bold text-ruby underline underline-offset-[3px] hover:text-oxblood"
            >
              ← Continue shopping
            </Link>
          </div>

          <OrderSummary
            lines={cart.lines}
            totals={cart.totals}
            provisionalPricing={cart.provisionalPricing}
            discountCode={cart.discountCode}
            freeDeliveryThresholdRs={cart.freeDeliveryThresholdRs}
          >
            <DiscountForm
              currentCode={cart.discountCode}
              serverError={cart.discountError}
            />

            <ButtonLink href="/checkout" className="mt-6 w-full">
              Proceed to checkout
            </ButtonLink>

            <p className="mt-3 text-center text-[0.76rem] text-muted">
              No account needed — checkout as a guest.
            </p>
          </OrderSummary>
        </div>
      )}
    </main>
  );
}
