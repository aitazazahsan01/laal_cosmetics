"use client";

import { useActionState } from "react";

import { applyDiscountAction, type DiscountFormState } from "@/app/actions/cart";

const initialState: DiscountFormState = { message: null, applied: false };

/**
 * Discount code entry.
 *
 * Validation is entirely server-side (lib/discounts.ts) — this only shows the result.
 * With no codes created yet, every entry legitimately comes back "not recognised".
 */
export function DiscountForm({
  currentCode,
  serverError,
}: {
  currentCode: string | null;
  serverError: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    applyDiscountAction,
    initialState,
  );

  // The action's own message wins; otherwise fall back to a stored code that stopped
  // validating between page loads (expired, limit reached, deactivated).
  const message = state.message ?? serverError;
  const isError = state.message ? !state.applied : Boolean(serverError);

  return (
    <div className="mt-5">
      <form action={formAction} className="flex gap-2">
        <label htmlFor="discount-code" className="sr-only">
          Discount code
        </label>
        <input
          id="discount-code"
          name="code"
          type="text"
          defaultValue={currentCode ?? ""}
          placeholder="Discount code"
          autoComplete="off"
          className="min-w-0 flex-1 rounded border border-line bg-white px-3 py-[0.6rem] text-[0.85rem] focus:border-ruby focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded border border-oxblood px-[0.9rem] py-[0.6rem] text-[0.72rem] font-bold uppercase tracking-nav text-oxblood hover:bg-white disabled:opacity-60"
        >
          {pending ? "Checking" : "Apply"}
        </button>
      </form>

      {message ? (
        <p
          role="status"
          className={`mt-2 text-[0.78rem] ${isError ? "text-ruby" : "text-oxblood"}`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}

export default DiscountForm;
