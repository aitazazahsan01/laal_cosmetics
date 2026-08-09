"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

import { PRIMARY_NAV } from "@/lib/config";
import { useWishlist } from "@/components/wishlist/WishlistProvider";

/**
 * The interactive part of the header.
 *
 * The static Phase A mockups faked the mobile menu with a hidden checkbox; this is the real
 * thing — React state, proper aria-expanded/aria-controls wiring, closes on route change and
 * on Escape.
 *
 * `cartCount` is passed in from the server wrapper (Header.tsx), which reads the cart cookie.
 * That keeps the badge correct on first paint, with no loading flash and no hydration
 * mismatch from reading a cookie on the client.
 *
 * Nav links point at their final routes. Several are still unbuilt and will 404 for now; that
 * is intentional so the information architecture does not have to change later.
 */
export function HeaderBar({ cartCount }: { cartCount: number }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuId = useId();
  const { count: wishlistCount } = useWishlist();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="relative mx-auto flex max-w-shell items-center justify-between px-5 py-[0.9rem]">
        <Link href="/" className="flex items-center" aria-label="LAAL — home">
          {/*
            The approved vector lockup, used as-is. Never recoloured, never rastered,
            never given a shadow. Plain <img> rather than next/image because the file is a
            static SVG that needs no optimisation pipeline.
          */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/LAAL_lockup-1.svg"
            alt="LAAL"
            width={40}
            height={46}
            className="h-[46px] w-auto"
          />
        </Link>

        <nav
          id={menuId}
          aria-label="Primary"
          className={`${
            open ? "block" : "hidden"
          } absolute left-0 right-0 top-full border-b border-line bg-white px-5 pb-6 pt-4 lg:static lg:block lg:border-0 lg:bg-transparent lg:p-0`}
        >
          <ul className="flex flex-col gap-[1.1rem] lg:flex-row lg:items-center lg:gap-7">
            {PRIMARY_NAV.map((item) => {
              const isCurrent = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isCurrent ? "page" : undefined}
                    className={`text-[0.8rem] font-semibold uppercase tracking-nav hover:text-ruby ${
                      isCurrent ? "text-ruby" : "text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/wishlist"
            className={`flex items-center gap-[0.4rem] text-[0.82rem] font-semibold ${
              wishlistCount > 0 ? "text-ruby" : "text-ink"
            }`}
            aria-label={`Wishlist, ${wishlistCount} ${wishlistCount === 1 ? "item" : "items"}`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={wishlistCount > 0 ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 20.5s-7.5-4.6-10-9.3C.5 7.8 2.2 4.5 5.4 4c2.1-.3 4 .8 6.6 3.2C14.6 4.8 16.5 3.7 18.6 4c3.2.5 4.9 3.8 3.4 7.2-2.5 4.7-10 9.3-10 9.3z" />
            </svg>
            <span aria-hidden="true">{wishlistCount}</span>
          </Link>

          <Link
            href="/cart"
            className={`flex items-center gap-[0.4rem] text-[0.82rem] font-semibold ${
              cartCount > 0 ? "text-ruby" : "text-ink"
            }`}
            aria-label={`Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M1 1h4l2.6 13.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6L23 6H6" />
            </svg>
            <span aria-hidden="true">{cartCount}</span>
          </Link>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex flex-col gap-1 p-[0.4rem] lg:hidden"
          >
            <span className="block h-[2px] w-5 bg-oxblood" />
            <span className="block h-[2px] w-5 bg-oxblood" />
            <span className="block h-[2px] w-5 bg-oxblood" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default HeaderBar;
