"use client";

import { useWishlist } from "@/components/wishlist/WishlistProvider";

/**
 * Heart-icon toggle — no account, no server round-trip, see WishlistProvider.tsx.
 */
export function WishlistButton({
  slug,
  productName,
  className = "",
}: {
  slug: string;
  productName: string;
  className?: string;
}) {
  const { has, toggle } = useWishlist();
  const saved = has(slug);

  return (
    <button
      type="button"
      onClick={() => toggle(slug)}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${productName} from wishlist` : `Save ${productName} to wishlist`}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
        saved
          ? "border-ruby bg-ruby text-white"
          : "border-line bg-white text-muted hover:border-ruby hover:text-ruby"
      } ${className}`}
    >
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 20.5s-7.5-4.6-10-9.3C.5 7.8 2.2 4.5 5.4 4c2.1-.3 4 .8 6.6 3.2C14.6 4.8 16.5 3.7 18.6 4c3.2.5 4.9 3.8 3.4 7.2-2.5 4.7-10 9.3-10 9.3z" />
      </svg>
    </button>
  );
}

export default WishlistButton;
