import type { Metadata } from "next";

import { deriveExclusions } from "@/lib/ingredients";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { PendingNote } from "@/components/ui/PendingNote";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description:
    "Two serums, made in Pakistan for LAAL, Islamabad. Every active named on the box.",
};

/**
 * About.
 *
 * Content provenance:
 *  - The manufacturing facts block is real, taken from the approved packaging artwork. The
 *    manufacturer's own name and address are still a literal placeholder on LAAL's box art,
 *    so that row is a <PendingNote> rather than a guess.
 *  - "What's never in a LAAL bottle" is COMPUTED from both products' INCI lists at render
 *    time (lib/ingredients.ts) — the absence claims are only shown when the code has actually
 *    verified the absence, so a reformulation cannot leave a false claim on the page.
 *  - The test-accuracy callout is a flag, not copy. "Formulation tested" and "every batch
 *    tested" are materially different claims and only LAAL can say which is true.
 *  - The brand story is entirely LAAL's to write.
 */
export default async function AboutPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const exclusions = deriveExclusions(products);

  return (
    <main className="mx-auto w-full max-w-[900px] px-5">
      <PageHeader
        label="About LAAL"
        heading={
          <span className="border-l-2 border-dashed border-ruby pl-4">
            Why LAAL exists
          </span>
        }
        lede={
          <>
            <p>
              Two serums. Every active named on the box, not buried in a QR code.
              That much we can say without waiting on copy — the rest of this page
              is LAAL&rsquo;s story to tell.
            </p>
            <PendingNote
              label="Headline pending — LAAL to supply"
              className="mt-3"
            />
          </>
        }
      />

      {/* Manufacturing — real, from the approved packaging artwork */}
      <section className="border-t border-line py-11">
        <span className="label">Made &amp; tested</span>
        <h2 className="mt-1 font-serif text-[1.4rem]">Manufacturing</h2>
        <p className="mt-4 max-w-[62ch] text-[0.98rem]">
          Every LAAL bottle is made in Pakistan, for LAAL, Islamabad — the details
          below come straight from the packaging artwork already approved for
          print.
        </p>

        <dl className="mt-6 grid max-w-[62ch] grid-cols-[auto_1fr] gap-x-6 gap-y-3 rounded-panel border border-line bg-blush p-7 text-[0.92rem]">
          <dt className="text-muted">Manufactured by</dt>
          <dd>
            <PendingNote label="Still a placeholder on the box art — needed before launch" />
          </dd>

          <dt className="text-muted">Manufactured for</dt>
          <dd>LAAL, Islamabad, Pakistan</dd>

          <dt className="text-muted">Made in</dt>
          <dd>Pakistan</dd>

          <dt className="text-muted">Shelf life once opened</dt>
          <dd>6 months</dd>
        </dl>

        <div className="mt-5 max-w-[62ch] rounded-card border border-dashed border-ruby bg-ruby/[0.05] p-5 text-[0.88rem]">
          <strong className="text-oxblood">Wording check needed:</strong>{" "}
          &ldquo;formulation tested&rdquo; and &ldquo;every batch tested&rdquo;
          are different claims. Whichever is true, this page needs to say that one
          precisely — it is the one line here we will not draft.
        </div>
      </section>

      {/* Exclusions — computed against the real INCI lists */}
      <section className="border-t border-line py-11">
        <span className="label">What&rsquo;s never in a LAAL bottle</span>
        <h2 className="mt-1 font-serif text-[1.4rem]">
          Checked directly against{" "}
          {products.length > 1 ? "both full INCI lists" : "the full INCI list"}
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {exclusions
            .filter((exclusion) => exclusion.verified)
            .map((exclusion) => (
              <div
                key={exclusion.label}
                className="flex items-start gap-3 rounded-card border border-line p-5 text-[0.94rem]"
              >
                <span aria-hidden="true" className="flex-none font-bold text-ruby">
                  ✕
                </span>
                <div>
                  {exclusion.label}
                  <span className="mt-1 block text-[0.78rem] text-muted">
                    {exclusion.basis}
                  </span>
                </div>
              </div>
            ))}

          <div className="flex items-center rounded-card border border-line p-5">
            <PendingNote label="Further points pending — LAAL to supply" />
          </div>
        </div>
      </section>

      {/* Brand story — nothing written on LAAL's behalf */}
      <section className="border-t border-line py-11">
        <span className="label">Why LAAL</span>
        <h2 className="mt-1 font-serif text-[1.4rem]">The full story</h2>
        <p className="mt-4 max-w-[62ch] text-[0.95rem] text-muted">
          LAAL&rsquo;s founding story, the gap in the market it addresses and its
          long-term intent belong here, in LAAL&rsquo;s own voice.
        </p>
        <PendingNote
          variant="block"
          label="Brand story pending — LAAL to supply"
          className="mt-5 max-w-[62ch]"
        />
      </section>
    </main>
  );
}
