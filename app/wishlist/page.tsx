import type { Metadata } from "next";

import { WishlistPageContent } from "@/components/wishlist/WishlistPageContent";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Serums you've saved for later.",
};

/**
 * Wishlist (no account, no server-side cart-style cookie — see WishlistProvider.tsx). The page
 * itself is just a shell; everything that needs to know which slugs are saved lives client-side.
 */
export default function WishlistPage() {
  return (
    <main className="shell-narrow">
      <div className="pb-8 pt-10">
        <span className="label">Wishlist</span>
        <h1 className="mt-2 font-serif text-[clamp(1.8rem,3.6vw,2.4rem)]">
          Saved for later
        </h1>
        <p className="mt-2 text-[0.92rem] text-muted">
          Saved on this device — no account needed.
        </p>
      </div>

      <WishlistPageContent />
    </main>
  );
}
