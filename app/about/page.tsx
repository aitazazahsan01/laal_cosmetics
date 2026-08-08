import type { Metadata } from "next";

import { deriveExclusions } from "@/lib/ingredients";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { PendingNote } from "@/components/ui/PendingNote";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  // `absolute` bypasses the root layout's "%s — LAAL" title template.
  title: { absolute: "Why We Built LAAL | Skincare Without Fairness Claims" },
  description:
    "Why a Pakistani skincare brand that prints every ingredient, names every concentration and refuses to sell skin lightening.",
};

/**
 * About.
 *
 * Content provenance:
 *  - The lede, brand-story section, manufacturing paragraph and "Independently tested" block
 *    are real, from the LAAL Website Content Pack §8.
 *  - The manufacturer's own registered name is still explicitly "still to come" (Content Pack
 *    §13.4), so that row stays a <PendingNote> rather than a guess.
 *  - "What's never in a LAAL bottle" is COMPUTED from both products' INCI lists at render
 *    time (lib/ingredients.ts) — the absence claims are only shown when the code has actually
 *    verified the absence, so a reformulation cannot leave a false claim on the page.
 *  - The test-accuracy block states precisely what was tested — "the formulations were
 *    tested," not "every batch is tested" — per Content Pack §12.
 *  - "The full story" (founder narrative) is still genuinely pending — LAAL's to write.
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
          <p>
            Seven in ten Pakistani women who use skin-lightening products are
            estimated to be at risk of mercury exposure. That single number
            is the reason LAAL exists.
          </p>
        }
      />

      {/* Why this brand exists — real, Content Pack §8 */}
      <section className="border-t border-line py-11">
        <span className="label">Why this brand exists</span>
        <div className="mt-4 max-w-[62ch] space-y-4 text-[0.98rem]">
          <p>
            Walk into most pharmacies in Pakistan and read the back of what
            is on the shelf. Very little of it would survive five minutes of
            scrutiny against the pharmacology it claims to be built on.
            Mercury listed as calomel. Hydroquinone at concentrations that
            should require a prescription. Class-one topical corticosteroids
            sold in unlabelled tubs from wholesale markets as &ldquo;fairness
            mixes&rdquo;. Products marketed to teenagers with no ingredient
            list at all.
          </p>
          <p>
            LAAL is the answer to that. Two serums. Every ingredient
            printed. Every active named at the concentration it is used.
            Nothing in either bottle that we are not prepared to explain,
            ingredient by ingredient, to anyone who asks.
          </p>
          <p className="font-bold text-oxblood">
            We do not sell fairness. There is no such thing as a safe
            skin-lightening shortcut, and we will never build one. What we
            sell is oil control, barrier repair, and the honest management
            of blemishes and the marks they leave behind.
          </p>
        </div>
      </section>

      {/* Manufacturing — real, from the approved packaging artwork */}
      <section className="border-t border-line py-11">
        <span className="label">Made &amp; tested</span>
        <h2 className="mt-1 font-serif text-[1.4rem]">Manufacturing</h2>
        <p className="mt-4 max-w-[62ch] text-[0.98rem]">
          Both serums are manufactured and filled to our specification by a
          Karachi-based contract manufacturer holding ISO 22716:2007
          (Cosmetics — Good Manufacturing Practices) and ISO 9001:2015
          (Quality Management) certification. Every batch is dispatched with
          a quality-control report. Batch number, manufacture date and
          expiry date are printed on the base of every bottle.
        </p>

        <dl className="mt-6 grid max-w-[62ch] grid-cols-[auto_1fr] gap-x-6 gap-y-3 rounded-panel border border-line bg-blush p-7 text-[0.92rem]">
          <dt className="text-muted">Manufactured by</dt>
          <dd>
            <PendingNote label="Manufacturer's registered name pending — LAAL to supply" />
          </dd>

          <dt className="text-muted">Manufactured for</dt>
          <dd>LAAL, Islamabad, Pakistan</dd>

          <dt className="text-muted">Made in</dt>
          <dd>Pakistan</dd>

          <dt className="text-muted">Shelf life once opened</dt>
          <dd>6 months</dd>
        </dl>

        <div className="mt-5 max-w-[62ch] rounded-card border border-line bg-blush p-5 text-[0.9rem]">
          <strong className="text-oxblood">Independently tested.</strong>{" "}
          Both formulations were submitted to PCSIR Laboratories Islamabad —
          a Government of Pakistan laboratory — before a single bottle was
          sold. Patch test: negative, both serums. pH: 5.50 and 5.88,
          skin-compatible. Mercury: not detectable. Yeast and mould: not
          detectable. Report available on request.
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
