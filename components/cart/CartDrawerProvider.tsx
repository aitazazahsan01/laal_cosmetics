"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { CartSummary } from "@/app/actions/cart";

/**
 * Client-side cart drawer state.
 *
 * Holds nothing that isn't also derivable from the server (the cart cookie stays the single
 * source of truth) — this is purely UI state: is the drawer open, and the last cart snapshot
 * fetched via getCartSummaryAction() to render inside it without a full page reload.
 *
 * Storefront-only, same as Header/Footer/WhatsAppFloat — never mounted for the admin panel.
 * See app/layout.tsx.
 */
type CartDrawerContextValue = {
  isOpen: boolean;
  summary: CartSummary | null;
  /** Opens the drawer, optionally replacing the cart snapshot it shows. */
  open: (summary?: CartSummary) => void;
  close: () => void;
  setSummary: (summary: CartSummary) => void;
};

const CartDrawerContext = createContext<CartDrawerContextValue | null>(null);

export function CartDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [summary, setSummaryState] = useState<CartSummary | null>(null);

  const open = useCallback((next?: CartSummary) => {
    if (next) setSummaryState(next);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const setSummary = useCallback((next: CartSummary) => {
    setSummaryState(next);
  }, []);

  const value = useMemo<CartDrawerContextValue>(
    () => ({ isOpen, summary, open, close, setSummary }),
    [isOpen, summary, open, close, setSummary],
  );

  return (
    <CartDrawerContext.Provider value={value}>
      {children}
    </CartDrawerContext.Provider>
  );
}

export function useCartDrawer(): CartDrawerContextValue {
  const context = useContext(CartDrawerContext);
  if (!context) {
    throw new Error("useCartDrawer must be used within a CartDrawerProvider");
  }
  return context;
}

export default CartDrawerProvider;
