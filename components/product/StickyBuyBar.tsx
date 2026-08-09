"use client";

import { useEffect, useState } from "react";

import { AddToCartButton } from "@/components/product/AddToCartButton";
import { PendingNote } from "@/components/ui/PendingNote";

/**
 * Mobile sticky buy bar — appears only once the main buy box (#buy-box, the price/size/
 * add-to-cart block in ProductPageTemplate) has scrolled out of view, via IntersectionObserver.
 *
 * Previously this bar was permanently fixed on mobile regardless of scroll position, which
 * meant it duplicated and partly covered the real buy box a visitor sees first. Making it
 * scroll-triggered keeps the same "checkout is always one tap away" benefit without covering
 * content that's already on screen.
 */
export function StickyBuyBar({
  slug,
  inStock,
  sizeMl,
  price,
  listPrice,
}: {
  slug: string;
  inStock: boolean;
  sizeMl: number;
  price: string | null;
  listPrice: string | null;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById("buy-box");
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-line bg-white py-3 pl-4 pr-[5.5rem] shadow-stickybar lg:hidden"
      role="region"
      aria-label="Buy this product"
    >
      <div>
        <div className="flex items-baseline gap-2">
          {listPrice ? (
            <span className="text-[0.8rem] text-muted line-through">
              {listPrice}
            </span>
          ) : null}
          <span className="font-serif text-[1.15rem] text-oxblood">
            {price ?? "Rs."}
          </span>
        </div>
        {price ? null : <PendingNote label="Price pending" className="mt-1" />}
        <div className="mt-1 text-[0.8rem] text-muted">{sizeMl} ml</div>
      </div>
      <AddToCartButton slug={slug} inStock={inStock} />
    </div>
  );
}

export default StickyBuyBar;
