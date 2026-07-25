import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/PageHeader";
import { StockistForm } from "@/components/stockists/StockistForm";

export const metadata: Metadata = {
  title: "Stockists",
  description:
    "Clinics, salons, pharmacies and distributors — enquire about stocking LAAL.",
};

/**
 * Stockists / wholesale.
 *
 * Kept structurally separate from Contact per the SRS. No pricing appears here: wholesale
 * terms are never published publicly, and the page says so plainly rather than leaving a
 * conspicuous gap where a price list would go.
 */
export default function StockistsPage() {
  return (
    <main className="mx-auto w-full max-w-[900px] px-5 pb-20">
      <PageHeader
        label="Stockists"
        heading="Stock LAAL in your clinic, salon or pharmacy."
        lede={
          <p className="text-muted">
            LAAL works with a small number of partners across Pakistan. Tell us
            about your business and we&rsquo;ll get back to you directly.
          </p>
        }
      />

      <section className="border-t border-line py-10">
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              title: "Full ingredient transparency",
              body: "Every active named and every INCI list printed — the same information your customers get.",
            },
            {
              title: "Made in Pakistan",
              body: "Manufactured for LAAL, Islamabad. Local supply, no import lead times.",
            },
            {
              title: "Direct line to LAAL",
              body: "Partner enquiries are handled by the team, not a reseller network.",
            },
          ].map((point) => (
            <div key={point.title} className="border-t-2 border-ruby pt-4">
              <h2 className="text-[1rem]">{point.title}</h2>
              <p className="mt-2 text-[0.9rem] text-muted">{point.body}</p>
            </div>
          ))}
        </div>

        <p className="mb-8 max-w-[62ch] rounded-card border border-line bg-blush px-5 py-4 text-[0.88rem] text-muted">
          Wholesale pricing and terms are shared privately after we&rsquo;ve
          spoken — they are not published on this site.
        </p>

        <StockistForm />
      </section>
    </main>
  );
}
