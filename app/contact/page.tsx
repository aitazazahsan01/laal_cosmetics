import type { Metadata } from "next";
import Link from "next/link";

import {
  CONTACT_EMAIL,
  SITE,
  WHATSAPP_CONFIGURED,
  WHATSAPP_URL,
} from "@/lib/config";
import { ContactForm } from "@/components/contact/ContactForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { PendingNote } from "@/components/ui/PendingNote";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with LAAL.",
};

/**
 * Contact.
 *
 * Both direct channels are still pending from LAAL, so each card says so rather than showing
 * a placeholder number or address someone might actually try to use. The form works
 * regardless, which is why it is on the page and not gated behind the missing details.
 */
export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-[900px] px-5 pb-20">
      <PageHeader
        label="Contact"
        heading="Questions about a formula, an order, or anything else."
        lede={
          <p className="text-muted">
            Message us and the team will get back to you. For stocking LAAL in a
            business, use the{" "}
            <Link
              href="/stockists"
              className="text-ruby underline underline-offset-[3px] hover:text-oxblood"
            >
              stockists page
            </Link>{" "}
            instead.
          </p>
        }
      />

      <section className="border-t border-line py-10">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="rounded-panel border border-line bg-blush p-7">
            <span className="text-[0.72rem] uppercase tracking-nav text-muted">
              WhatsApp
            </span>
            <h2 className="mt-2 font-serif text-[1.2rem]">Message us directly</h2>
            <p className="mt-3 text-[0.9rem] text-muted">
              The fastest way to reach LAAL, and where order updates are sent.
            </p>
            <div className="mt-4">
              {WHATSAPP_CONFIGURED ? (
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[0.9rem] font-bold text-ruby underline underline-offset-[3px] hover:text-oxblood"
                >
                  Open WhatsApp →
                </a>
              ) : (
                <PendingNote label="Number pending — LAAL to supply" />
              )}
            </div>
          </div>

          <div className="rounded-panel border border-line bg-blush p-7">
            <span className="text-[0.72rem] uppercase tracking-nav text-muted">
              Email
            </span>
            <h2 className="mt-2 font-serif text-[1.2rem]">Write to us</h2>
            <p className="mt-3 text-[0.9rem] text-muted">
              For anything that needs a paper trail — orders, returns, press.
            </p>
            <div className="mt-4">
              {CONTACT_EMAIL ? (
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-[0.9rem] font-bold text-ruby underline underline-offset-[3px] hover:text-oxblood"
                >
                  {CONTACT_EMAIL}
                </a>
              ) : (
                <PendingNote label="Address pending — LAAL to supply" />
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line py-10">
        <div className="rounded-panel border border-line bg-blush p-7">
          <span className="text-[0.72rem] uppercase tracking-nav text-muted">
            Address
          </span>
          <p className="mt-2 text-[0.95rem]">{SITE.address}</p>
        </div>
      </section>

      <section className="border-t border-line py-10">
        <span className="label">Send a message</span>
        <h2 className="mb-7 mt-1 font-serif text-[1.4rem]">
          Or use the form
        </h2>
        <ContactForm />
        <p className="mt-6 max-w-[52ch] text-[0.82rem] text-muted">
          {SITE.legalName}, {SITE.city}.
        </p>
      </section>
    </main>
  );
}
