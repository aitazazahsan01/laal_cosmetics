"use client";

import { useEffect, useId, useRef } from "react";

import { formatRsExact } from "@/lib/pricing";
import { useCartDrawer } from "@/components/cart/CartDrawerProvider";
import { BottleMark } from "@/components/ui/BottleMark";
import { ButtonLink } from "@/components/ui/Button";
import { FreeDeliveryProgress } from "@/components/cart/FreeDeliveryProgress";

/**
 * Slide-over cart drawer — feedback right after "Add to cart", not a replacement for /cart.
 *
 * Opened by <AddToCartButton> after a successful add. Mirrors the accessibility pattern already
 * used by HeaderBar.tsx's mobile menu: Escape closes it, and it is a real modal (role="dialog",
 * aria-modal) rather than content that happens to be visually on top. Click on the backdrop
 * also closes it, same as a click outside the mobile nav would be expected to.
 *
 * The header's cart icon still links straight to /cart and is untouched — this drawer is only
 * about confirming an add just worked.
 */
export function CartDrawer() {
  const { isOpen, summary, close } = useCartDrawer();
  const headingId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

  useEffect(() => {
    if (isOpen) closeButtonRef.current?.focus();
  }, [isOpen]);

  // Prevent the page behind the drawer from scrolling while it is open.
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const lines = summary?.lines ?? [];
  const isEmpty = lines.length === 0;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        onClick={close}
        aria-label="Close cart"
        className="absolute inset-0 bg-oxblood/40"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col bg-white shadow-float"
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 id={headingId} className="font-serif text-[1.2rem]">
            Added to cart
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={close}
            aria-label="Close cart"
            className="text-[1.4rem] leading-none text-muted hover:text-ruby"
          >
            &times;
          </button>
        </div>

        {!isEmpty ? (
          <FreeDeliveryProgress
            subtotalRs={summary?.subtotalRs ?? 0}
            thresholdRs={summary?.freeDeliveryThresholdRs ?? null}
            className="border-b border-line px-6 py-4"
          />
        ) : null}

        <div className="flex-grow overflow-y-auto px-6 py-4">
          {isEmpty ? (
            <p className="py-8 text-center text-[0.92rem] text-muted">
              Your cart is empty.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {lines.map((line) => (
                <li key={line.slug} className="flex items-center gap-4 py-4">
                  <div className="flex h-[64px] w-[64px] flex-none items-center justify-center">
                    {line.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={line.imageUrl}
                        alt={line.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <BottleMark variant="front" height={64} />
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="text-[0.92rem]">{line.name}</div>
                    <div className="mt-[0.15rem] text-[0.8rem] text-muted">
                      Qty {line.quantity}
                    </div>
                  </div>
                  <div className="flex-none font-serif text-[0.95rem] text-oxblood tabular-nums">
                    {formatRsExact(line.lineTotalRs)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!isEmpty ? (
          <div className="border-t border-line px-6 py-5">
            <div className="flex items-center justify-between text-[0.95rem]">
              <span className="text-muted">Subtotal</span>
              <span className="font-serif text-[1.1rem] text-oxblood tabular-nums">
                {formatRsExact(summary?.subtotalRs ?? 0)}
              </span>
            </div>

            <div className="mt-4 flex gap-3">
              <ButtonLink
                href="/cart"
                variant="secondary"
                onClick={close}
                className="flex-1 justify-center"
              >
                View cart
              </ButtonLink>
              <ButtonLink
                href="/checkout"
                variant="primary"
                onClick={close}
                className="flex-1 justify-center"
              >
                Checkout
              </ButtonLink>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default CartDrawer;
