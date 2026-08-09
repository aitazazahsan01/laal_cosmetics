"use client";

import { useActionState, useState } from "react";

import { placeOrderAction } from "@/app/actions/checkout";
import { initialCheckoutState } from "@/lib/checkout-state";
import { PAYMENT_ACCOUNTS, PROVINCES } from "@/lib/config";
import { PAYMENT_METHOD_LABELS, PAYMENT_METHODS, type PaymentMethod } from "@/lib/types";
import { PendingNote } from "@/components/ui/PendingNote";
import {
  FieldError,
  FieldLabel,
  TextField as Field,
  inputClass,
} from "@/components/ui/FormField";
import type { PricedLine, Totals } from "@/lib/pricing";
import { OrderSummary } from "@/components/cart/OrderSummary";

/**
 * Checkout (F-03 … F-06, F-09).
 *
 * Guest only. There is no account field, no "create an account" opt-in and no post-purchase
 * account prompt — the SRS requires guest checkout and nothing else exists.
 *
 * The order summary rendered here is a PREVIEW. No money value is submitted; the server
 * action forwards only the customer's details, and lib/orders.ts recomputes every figure from
 * the database inside the order transaction.
 */
export function CheckoutForm({
  lines,
  totals,
  provisionalPricing,
  discountCode,
  freeDeliveryThresholdRs,
}: {
  lines: PricedLine[];
  totals: Totals;
  provisionalPricing: boolean;
  discountCode: string | null;
  freeDeliveryThresholdRs: number | null;
}) {
  const [state, formAction, pending] = useActionState(
    placeOrderAction,
    initialCheckoutState,
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");

  const accounts =
    paymentMethod === "COD" ? null : PAYMENT_ACCOUNTS[paymentMethod];

  const fieldError = (name: string) => state.fieldErrors[name];

  return (
    <form
      action={formAction}
      className="grid grid-cols-1 gap-10 pb-20 lg:grid-cols-[1.5fr_1fr] lg:items-start"
    >
      <div>
        {state.error ? (
          <div
            role="alert"
            className="mb-6 rounded-card border border-ruby bg-ruby/[0.05] px-4 py-3 text-[0.9rem] text-ruby"
          >
            {state.error}
          </div>
        ) : null}

        <fieldset className="mb-9 border-0 p-0">
          <legend className="mb-5 w-full border-b border-line pb-4 font-serif text-[1.05rem] text-oxblood">
            Contact &amp; delivery
          </legend>

          <div className="grid grid-cols-1 gap-[1.1rem] sm:grid-cols-2">
            <Field
              className="sm:col-span-2"
              name="customerName"
              label="Full name"
              placeholder="Ayesha Khan"
              autoComplete="name"
              required
              error={fieldError("customerName")}
            />
            <Field
              name="customerWhatsapp"
              label="WhatsApp number"
              type="tel"
              placeholder="03xx-xxxxxxx"
              autoComplete="tel"
              required
              error={fieldError("customerWhatsapp")}
            />
            <Field
              name="customerEmail"
              label="Email"
              optional
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={fieldError("customerEmail")}
            />

            <div className="sm:col-span-2">
              <FieldLabel htmlFor="addressLine1">Full address</FieldLabel>
              <textarea
                id="addressLine1"
                name="addressLine1"
                rows={2}
                required
                autoComplete="street-address"
                placeholder="House / street / area"
                className={inputClass(Boolean(fieldError("addressLine1")))}
              />
              <FieldError message={fieldError("addressLine1")} />
            </div>

            <Field
              name="city"
              label="City"
              placeholder="Islamabad"
              autoComplete="address-level2"
              required
              error={fieldError("city")}
            />

            <div>
              <FieldLabel htmlFor="province">Province</FieldLabel>
              <select
                id="province"
                name="province"
                required
                defaultValue="Islamabad Capital Territory"
                className={inputClass(Boolean(fieldError("province")))}
              >
                {PROVINCES.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
              <FieldError message={fieldError("province")} />
            </div>

            <div className="sm:col-span-2">
              <FieldLabel htmlFor="notes" optional>
                Order notes
              </FieldLabel>
              <textarea
                id="notes"
                name="notes"
                rows={2}
                placeholder="Delivery instructions, landmark, etc."
                className={inputClass(false)}
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="mb-9 border-0 p-0">
          <legend className="mb-5 w-full border-b border-line pb-4 font-serif text-[1.05rem] text-oxblood">
            Payment method
          </legend>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {PAYMENT_METHODS.map((method) => {
              const selected = paymentMethod === method;
              return (
                <label
                  key={method}
                  className={`flex cursor-pointer items-center justify-center rounded-md px-2 py-[0.9rem] text-center text-[0.82rem] font-semibold ${
                    selected
                      ? "border-2 border-ruby bg-ruby/[0.07] text-ruby"
                      : "border border-line text-ink"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={selected}
                    onChange={() => setPaymentMethod(method)}
                    className="sr-only"
                  />
                  {PAYMENT_METHOD_LABELS[method]}
                </label>
              );
            })}
          </div>
          <FieldError message={fieldError("paymentMethod")} />

          <div className="mt-5 rounded-card border border-line bg-blush p-6 text-[0.9rem]">
            {paymentMethod === "COD" ? (
              <p>
                Pay in cash when your order arrives. Any COD surcharge is
                included in the total shown before you place the order.
              </p>
            ) : (
              <>
                <p>
                  Send the order total to LAAL&rsquo;s {accounts?.label} account,
                  then upload your payment screenshot.
                </p>

                <dl className="mt-3 grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 text-[0.88rem]">
                  {accounts?.fields.map((field) => (
                    <div key={field.label} className="contents">
                      <dt className="text-muted">{field.label}</dt>
                      <dd>
                        {field.value ? (
                          field.value
                        ) : (
                          <PendingNote label="Pending — LAAL to supply" />
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-5">
                  <FieldLabel htmlFor="paymentScreenshot" optional>
                    Payment screenshot
                  </FieldLabel>
                  <input
                    id="paymentScreenshot"
                    name="paymentScreenshot"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="block w-full rounded border border-dashed border-muted bg-white p-3 text-[0.82rem] text-muted file:mr-3 file:rounded file:border-0 file:bg-ruby file:px-3 file:py-1.5 file:text-[0.72rem] file:font-bold file:uppercase file:tracking-nav file:text-white"
                  />
                  <FieldError message={fieldError("paymentScreenshot")} />
                  <p className="mt-2 text-[0.76rem] text-muted">
                    JPG, PNG or WebP, up to 5 MB. You can also send it on
                    WhatsApp after ordering.
                  </p>
                </div>
              </>
            )}
          </div>
        </fieldset>
      </div>

      <OrderSummary
        lines={lines}
        totals={totals}
        provisionalPricing={provisionalPricing}
        discountCode={discountCode}
        freeDeliveryThresholdRs={freeDeliveryThresholdRs}
        showLineItems
      >
        <button
          type="submit"
          disabled={pending}
          className="mt-6 w-full rounded-btn bg-ruby px-4 py-4 text-[0.8rem] font-bold uppercase tracking-button text-white hover:bg-oxblood disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? "Placing order…" : "Place order"}
        </button>

        <p className="mt-3 text-center text-[0.74rem] text-muted">
          No card details are ever collected.
        </p>
      </OrderSummary>
    </form>
  );
}

export default CheckoutForm;
