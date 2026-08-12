"use client";

import { useActionState } from "react";

import { subscribeToNewsletterAction } from "@/app/actions/newsletter";
import { initialNewsletterState } from "@/lib/newsletter-state";

/**
 * Footer email capture. Stores the address now (NewsletterSubscriber); sends nothing until
 * Resend is configured, same "wired but inert" pattern as the rest of Phase 5.
 */
export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(
    subscribeToNewsletterAction,
    initialNewsletterState,
  );

  if (state.status === "success") {
    return (
      <p role="status" className="text-[0.85rem] text-blush/80">
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction}>
      {/* Honeypot — same convention as ContactForm/StockistForm. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="newsletter-company-website">Company website</label>
        <input
          id="newsletter-company-website"
          name="company_website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="flex gap-2">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          placeholder="Your email"
          required
          autoComplete="email"
          className="min-w-0 flex-1 rounded border border-blush/25 bg-transparent px-3 py-[0.55rem] text-[0.85rem] text-blush placeholder:text-blush/50 focus:border-blush focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="flex-none rounded border border-blush/40 px-4 py-[0.55rem] text-[0.72rem] font-bold uppercase tracking-nav text-blush hover:bg-blush hover:text-oxblood disabled:opacity-60"
        >
          {pending ? "..." : "Join"}
        </button>
      </div>

      {state.status === "error" && state.message ? (
        <p role="alert" className="mt-2 text-[0.78rem] text-blush/70">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export default NewsletterForm;
