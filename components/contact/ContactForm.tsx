"use client";

import { useActionState } from "react";

import { submitContactMessageAction } from "@/app/actions/contact";
import { initialFormState } from "@/lib/form-state";
import { TextAreaField, TextField } from "@/components/ui/FormField";

/**
 * General enquiry form — three fields, single column.
 *
 * Intentionally the simplest form on the site, and a different shape from the stockist form:
 * it writes to ContactMessage, not StockistEnquiry, and triggers its own notification.
 */
export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    submitContactMessageAction,
    initialFormState,
  );

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="rounded-panel border border-ruby bg-blush p-8"
      >
        <h2 className="font-serif text-[1.3rem]">Message sent.</h2>
        <p className="mt-3 max-w-[46ch] text-[0.95rem] text-muted">
          Thanks {state.message} — your message has reached LAAL. Replies come
          from the team directly, usually on WhatsApp or by email.
        </p>
      </div>
    );
  }

  const fieldError = (name: string) => state.fieldErrors[name];

  return (
    <form action={formAction} className="max-w-[520px]">
      {state.status === "error" && state.message ? (
        <div
          role="alert"
          className="mb-6 rounded-card border border-ruby bg-ruby/[0.05] px-4 py-3 text-[0.9rem] text-ruby"
        >
          {state.message}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-[1.1rem]">
        <TextField
          name="name"
          label="Your name"
          autoComplete="name"
          required
          error={fieldError("name")}
        />
        <TextField
          name="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
          error={fieldError("email")}
        />
        <TextAreaField
          name="message"
          label="Message"
          rows={5}
          required
          error={fieldError("message")}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-6 rounded-btn bg-ruby px-8 py-4 text-[0.78rem] font-bold uppercase tracking-button text-white hover:bg-oxblood disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

export default ContactForm;
