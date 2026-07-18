import type { Metadata } from "next";

import { formatRs, getDeliverySettings, getProducts } from "@/lib/products";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { ProductCard } from "@/components/product/ProductCard";
import { BottleMark } from "@/components/ui/BottleMark";
import { PendingNote } from "@/components/ui/PendingNote";
import { ProductName } from "@/components/ui/ProductName";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Both LAAL serums, with the full ingredient list on every product page.",
};

/**
 * Shop.
 *
 * The product grid is live from the database. "The Pair" is a merchandising bundle whose
 * price LAAL has not set yet — it shows a <PendingNote> rather than a made-up figure, and
 * the bundle discount itself will be configured through the admin panel in Phase 2.
 */
export default async function ShopPage() {
  const products = await getProducts();
  const delivery = await getDeliverySettings();

  const freeDeliveryThreshold = formatRs(
    delivery?.freeDeliveryThresholdRs ?? null,
  );

  return (
    <main>
      {/* Delivery banner — COD nationwide is confirmed; the threshold is not set yet. */}
      <div className="border-b border-line bg-blush px-4 py-[0.6rem] text-center text-[0.82rem]">
        <span className="inline-flex flex-wrap items-center justify-center gap-2">
          {freeDeliveryThreshold ? (
            <span>Free delivery above {freeDeliveryThreshold}</span>
          ) : (
            <>
              <span>Free delivery threshold</span>
              <PendingNote label="Pending — LAAL to supply" />
            </>
          )}
          <span aria-hidden="true">·</span>
          <span>Cash on delivery available nationwide</span>
        </span>
      </div>

      <div className="shell-narrow">
        <div className="py-12">
          <span className="label">Shop</span>
          <h1 className="mt-[0.6rem] font-serif text-[clamp(2rem,4vw,2.6rem)]">
            Two serums. One pair, if you need both.
          </h1>
          <p className="mt-[0.9rem] max-w-[56ch] text-[1.02rem] text-muted">
            Add straight to cart from here, or open a product page for the full
            ingredient list and how-to-use guide before you decide.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 pb-section md:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              showAddToCart
            />
          ))}

          {/* The Pair — bundle card */}
          <article className="flex flex-col rounded-card border border-ruby bg-blush p-8">
            <div className="mb-2 flex items-center justify-center self-center">
              <BottleMark variant="front" height={126} />
              <BottleMark
                variant="label"
                height={126}
                className="-ml-4"
              />
            </div>

            <span className="text-[0.7rem] uppercase tracking-nav text-ruby">
              The Pair
            </span>

            <h3 className="mt-[0.3rem] font-serif text-[1.4rem]">
              <ProductName name="Niacinamide+" /> &amp;{" "}
              <ProductName name="Hyaluronic+" />
            </h3>

            <p className="mt-[0.2rem] text-[0.85rem] text-muted">
              Both 30 ml serums, one order
            </p>

            <p className="mt-[0.5rem] flex-grow text-[0.85rem]">
              Oil control by day, barrier repair whenever skin needs it — the two
              formulas together.
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <PendingNote label="Bundle price pending" />
            </div>

            {/* Submits both slugs in one go — see addToCartAction. */}
            <AddToCartButton
              slug={products.map((product) => product.slug)}
              inStock={products.every((product) => product.inStock)}
              label="Add bundle to cart"
              fullWidth
              className="mt-4"
            />

            <p className="mt-2 text-center text-[0.75rem] text-muted">
              Bundle discount to be configured in the admin panel.
            </p>
          </article>
        </div>
      </div>
    </main>
  );
}
