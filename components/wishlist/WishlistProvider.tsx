"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * No-login "save for later" list of product slugs, persisted in localStorage rather than a
 * cookie or the database — LAAL is guest-checkout-only with no accounts (see the SRS), and
 * unlike the cart, nothing here needs server-side price truth, so there's no reason to round-trip
 * it through the server the way CartDrawerProvider's cart summary does.
 *
 * Server-rendered markup always starts from an empty list (localStorage doesn't exist on the
 * server), then hydrates from storage in an effect after mount — the standard pattern for
 * client-only persisted state, and the same reason the count badge below can flash 0→N on load.
 */

const STORAGE_KEY = "laal_wishlist";

type WishlistContextValue = {
  slugs: string[];
  has: (slug: string) => boolean;
  toggle: (slug: string) => void;
  count: number;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

function readStoredSlugs(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    setSlugs(readStoredSlugs());
  }, []);

  const toggle = useCallback((slug: string) => {
    setSlugs((current) => {
      const next = current.includes(slug)
        ? current.filter((value) => value !== slug)
        : [...current, slug];
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Storage unavailable (private browsing, quota) — the in-memory list still works for
        // this page load, it just won't survive a refresh.
      }
      return next;
    });
  }, []);

  const has = useCallback((slug: string) => slugs.includes(slug), [slugs]);

  const value = useMemo<WishlistContextValue>(
    () => ({ slugs, has, toggle, count: slugs.length }),
    [slugs, has, toggle],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
