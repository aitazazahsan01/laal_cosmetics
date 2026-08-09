"use client";

import { useTransition, type FormEvent } from "react";

import { addToCartAction, getCartSummaryAction } from "@/app/actions/cart";
import { useCartDrawer } from "@/components/cart/CartDrawerProvider";
import { Button } from "@/components/ui/Button";

/**
 * Add-to-cart control.
 *
 * Still a plain <form action={addToCartAction}>, so a submission with JavaScript disabled (or
 * before hydration) works exactly as before: full page reload, cart cookie written, header
 * badge updated. That path is never removed — only enhanced.
 *
 * When JS is available, onSubmit intercepts the click, calls addToCartAction() and
 * getCartSummaryAction() imperatively inside a transition (both are Server Actions — calling
 * them directly rather than only via the form's `action` prop is supported), then pushes the
 * fresh cart snapshot into the CartDrawerProvider and opens it. This is what actually fixes the
 * "clicked Add to cart, saw nothing happen, clicked again" problem: there is now visible
 * confirmation right where the click happened, not just a header badge that ticks up quietly.
 *
 * The button still carries no price and no quantity beyond 1 — the client cannot influence what
 * an item costs. Out-of-stock is derived from Product.stockQty, so the disabled state is always
 * truthful.
 */
export function AddToCartButton({
  slug,
  inStock,
  label = "Add to cart",
  fullWidth = false,
  className = "",
}: {
  /** One slug, or several to add a bundle in a single submit (e.g. the Shop page's "Pair" card). */
  slug: string | string[];
  inStock: boolean;
  label?: string;
  fullWidth?: boolean;
  className?: string;
}) {
  const slugs = Array.isArray(slug) ? slug : [slug];
  const [isPending, startTransition] = useTransition();
  const { open } = useCartDrawer();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Read the form synchronously — every hidden `slug` input, same set the plain <form>
    // submission would have posted — before handing off to the async transition below.
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      await addToCartAction(formData);
      const summary = await getCartSummaryAction();
      open(summary);
    });
  }

  return (
    <form
      action={addToCartAction}
      onSubmit={handleSubmit}
      className={`${fullWidth ? "w-full" : ""} ${className}`}
    >
      {slugs.map((value) => (
        <input key={value} type="hidden" name="slug" value={value} />
      ))}
      <Button
        type="submit"
        variant="primary"
        disabled={!inStock || isPending}
        className={fullWidth ? "w-full" : ""}
      >
        {inStock ? (isPending ? "Adding…" : label) : "Sold out"}
      </Button>
    </form>
  );
}

export default AddToCartButton;
