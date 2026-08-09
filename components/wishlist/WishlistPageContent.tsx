"use client";

import { useEffect, useState } from "react";

import { getWishlistProductsAction } from "@/app/actions/wishlist";
import type { ProductView } from "@/lib/products";
import { useWishlist } from "@/components/wishlist/WishlistProvider";
import { ProductCard } from "@/components/product/ProductCard";
import { ButtonLink } from "@/components/ui/Button";

/**
 * Client-rendered: the wishlist itself only exists in localStorage (see WishlistProvider), so
 * the product data behind it can only be fetched after mount, once we know which slugs to ask
 * the server for.
 */
export function WishlistPageContent() {
  const { slugs } = useWishlist();
  const [products, setProducts] = useState<ProductView[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getWishlistProductsAction(slugs).then((result) => {
      if (!cancelled) setProducts(result);
    });
    return () => {
      cancelled = true;
    };
  }, [slugs]);

  // Still resolving the very first load (products === null) — say nothing rather than
  // flashing an "empty" message that may immediately be replaced once storage is read.
  if (products === null) return null;

  if (products.length === 0) {
    return (
      <div className="border-t border-line py-16">
        <h2 className="font-serif text-[1.3rem]">Your wishlist is empty.</h2>
        <p className="mt-3 max-w-[46ch] text-[0.95rem] text-muted">
          Tap the heart icon on either serum to save it here.
        </p>
        <div className="mt-7">
          <ButtonLink href="/shop">Shop the serums</ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 border-t border-line pt-10 sm:grid-cols-2">
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} showAddToCart />
      ))}
    </div>
  );
}

export default WishlistPageContent;
