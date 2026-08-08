"use client";

import { useActionState } from "react";

import { submitStockistEnquiryAction } from "@/app/actions/stockists";
import { BUSINESS_TYPES, initialFormState } from "@/lib/form-state";
import {
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/ui/FormField";

/**
 * Stockist / wholesale enquiry form.
 *
 * Structurally and visually separate from the Contact form, per the SRS — this is a
 * qualification form (business, type, city, volume) feeding a sales funnel, not a general
 * message box. On success it swaps the whole form for a real confirmation panel rather than
 * flashing an alert, so the person can see their enquiry actually landed.
 *
 * No pricing appears anywhere on this page or in this component.
 */
export function StockistForm() {
  const [state, formAction, pending] = useActionState(
    submitStockistEnquiryAction,
    initialFormState,
  );

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="rounded-panel border border-ruby bg-blush p-9 text-center"
      >
        <div className="mx-auto mb-5 flex h-[3.4rem] w-[3.4rem] items-center justify-center rounded-full border-2 border-ruby">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8C1C35"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h2 className="font-serif text-[1.4rem]">Thanks — we&rsquo;ll be in touch.</h2>
        <p className="mx-auto mt-3 max-w-[46ch] text-[0.95rem] text-muted">
          Your enquiry for <strong className="text-ink">{state.message}</strong>{" "}
          has been received. LAAL reviews stockist enquiries directly and will
          reply on the WhatsApp number you gave.
        </p>
        <p className="mx-auto mt-3 max-w-[46ch] text-[0.85rem] text-muted">
          Wholesale terms are shared privately, not published on the site.
        </p>
      </div>
    );
  }

  const fieldError = (name: string) => state.fieldErrors[name];

  return (
    <form action={formAction}>
      {state.status === "error" && state.message ? (
        <div
          role="alert"
          className="mb-6 rounded-card border border-ruby bg-ruby/[0.05] px-4 py-3 text-[0.9rem] text-ruby"
        >
          {state.message}
        </div>
      ) : null}

      {/*
        Honeypot: real visitors never see this (display:none, not just visually hidden — using
        sr-only here would expose it to screen-reader users, which we don't want), but a bot
        that fills every field programmatically trips it. Server action checks it and pretends
        success without persisting or notifying anyone.
      */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="company_website">Company website</label>
        <input
          id="company_website"
          name="company_website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid grid-cols-1 gap-[1.1rem] sm:grid-cols-2">
        <TextField
          name="businessName"
          label="Business name"
          placeholder="e.g. Meridian Skin Clinic"
          required
          error={fieldError("businessName")}
        />
        <SelectField
          name="businessType"
          label="Business type"
          placeholder="Select one"
          options={BUSINESS_TYPES}
          required
          error={fieldError("businessType")}
        />
        <TextField
          name="contactName"
          label="Contact person"
          autoComplete="name"
          required
          error={fieldError("contactName")}
        />
        <TextField
          name="whatsapp"
          label="WhatsApp number"
          type="tel"
          placeholder="03xx-xxxxxxx"
          autoComplete="tel"
          required
          error={fieldError("whatsapp")}
        />
        <TextField
          name="city"
          label="City"
          placeholder="Islamabad"
          autoComplete="address-level2"
          required
          error={fieldError("city")}
        />
        <TextField
          name="expectedMonthlyVolume"
          label="Expected monthly volume"
          optional
          placeholder="e.g. 20–50 units"
          error={fieldError("expectedMonthlyVolume")}
        />
        <TextAreaField
          className="sm:col-span-2"
          name="message"
          label="Message"
          optional
          rows={4}
          placeholder="Anything else that would help us respond."
          error={fieldError("message")}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-7 rounded-btn bg-ruby px-8 py-4 text-[0.78rem] font-bold uppercase tracking-button text-white hover:bg-oxblood disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}

export default StockistForm;
