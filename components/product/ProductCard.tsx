import Link from "next/link";

import { formatRs, type ProductView } from "@/lib/products";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { WishlistButton } from "@/components/product/WishlistButton";
import { BottleMark } from "@/components/ui/BottleMark";
import { PendingNote } from "@/components/ui/PendingNote";
import { ProductName } from "@/components/ui/ProductName";

/**
 * Product card, used on Home and Shop.
 *
 * The actives line is always shown beneath the name (SRS P-02). Price is either the real
 * value or a <PendingNote> — never a placeholder number.
 */
export function ProductCard({
  product,
  showAddToCart = false,
}: {
  product: ProductView;
  showAddToCart?: boolean;
}) {
  const href = `/${product.slug}`;
  const price = formatRs(product.priceRs);
  const listPrice =
    product.listPriceRs !== null &&
    product.priceRs !== null &&
    product.listPriceRs > product.priceRs
      ? formatRs(product.listPriceRs)
      : null;

  const thumbnail = product.imageUrls[0];

  return (
    <article className="relative flex flex-col rounded-card border border-line bg-white p-8">
      <WishlistButton
        slug={product.slug}
        productName={product.name}
        className="absolute right-4 top-4 z-10"
      />

      <div className="mb-4 flex h-[200px] w-full items-center justify-center overflow-hidden rounded-panel border border-line border-t-2 border-t-ruby bg-blush p-4">
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt={product.name}
            className="h-full w-auto object-contain"
          />
        ) : (
          <BottleMark variant="front" height={168} />
        )}
      </div>

      <span className="text-[0.72rem] uppercase tracking-nav text-muted">
        {product.tagline}
      </span>

      <h3 className="mt-[0.3rem] font-serif text-[1.6rem]">
        <Link href={href} className="hover:text-ruby">
          <ProductName name={product.name} />
        </Link>
      </h3>

      <p className="mt-[0.15rem] text-[0.92rem] text-muted">
        {product.activesLine}
      </p>

      <p className="mt-[0.6rem] flex-grow text-[0.92rem]">
        {product.descriptor}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        {price ? (
          <span className="flex items-baseline gap-2">
            {listPrice ? (
              <span className="text-[0.85rem] text-muted line-through">
                {listPrice}
              </span>
            ) : null}
            <span className="font-serif text-[1.15rem] text-oxblood">{price}</span>
          </span>
        ) : (
          <PendingNote label="Price pending" />
        )}

        {showAddToCart ? (
          <span className="text-[0.75rem] uppercase tracking-nav text-muted">
            {product.sizeMl} ml · {product.stockLabel}
          </span>
        ) : (
          <Link
            href={href}
            className="text-[0.8rem] font-bold uppercase tracking-nav text-ruby underline underline-offset-[3px] hover:text-oxblood"
          >
            View product →
          </Link>
        )}
      </div>

      {showAddToCart ? (
        <AddToCartButton
          slug={product.slug}
          inStock={product.inStock}
          fullWidth
          className="mt-4"
        />
      ) : null}
    </article>
  );
}

export default ProductCard;
