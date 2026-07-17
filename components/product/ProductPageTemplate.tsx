import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { formatRs, getProductBySlug } from "@/lib/products";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { ProductGallery } from "@/components/product/ProductGallery";
import { Accordion, AccordionItem } from "@/components/ui/Accordion";
import { BottleMark } from "@/components/ui/BottleMark";
import { PendingNote } from "@/components/ui/PendingNote";
import { ProductName } from "@/components/ui/ProductName";

/**
 * The single product page template.
 *
 * Both /niacinamide and /hyaluronic render this, parameterised by slug — the page files
 * themselves are three lines each, so the two pages can never drift apart.
 *
 * Section order is fixed by the SRS (P-01 … P-12) and must not be rearranged:
 *   gallery → name/actives/descriptor → price/size/add-to-cart → short description →
 *   what it does → timeline → who it's for / who should wait → how to use →
 *   full INCI → patch test & storage → pairs with → FAQ
 *
 * Two rules are load-bearing:
 *   1. The full INCI list, the patch-test copy and the who-it's-for content render as plain
 *      always-visible sections. They are never placed inside the Accordion.
 *   2. Anything LAAL has not supplied renders a <PendingNote>. No gap is ever filled with
 *      invented copy — least of all the "who should wait" contraindications.
 */

/** Stub FAQ questions carried over from the approved Phase A mockups. Answers are pending. */
const STUB_FAQ = (productName: string, pairedName: string) => [
  { question: `Can I use ${productName} every day?`, answer: null },
  { question: `Can I use this with ${pairedName}?`, answer: null },
  { question: "How long does one bottle last?", answer: null },
];

const TIMELINE_STUB_LABELS = ["Week 1–2", "Week 3–4", "Week 6+"];

function SectionLabel({ children }: { children: ReactNode }) {
  return <span className="label mb-[0.6rem] block">{children}</span>;
}

function Section({
  label,
  heading,
  children,
  id,
}: {
  label: string;
  heading?: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="border-t border-line py-11">
      <SectionLabel>{label}</SectionLabel>
      {heading ? (
        <h2 className="mt-[0.2rem] font-serif text-[1.5rem]">{heading}</h2>
      ) : null}
      {children}
    </section>
  );
}

export async function buildProductMetadata(slug: string): Promise<Metadata> {
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found — LAAL" };

  return {
    title: `${product.name} — ${product.tagline} — LAAL`,
    description: `${product.name}. ${product.activesLine}. ${product.descriptor}`,
  };
}

export async function ProductPageTemplate({ slug }: { slug: string }) {
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const paired = await getProductBySlug(product.pairsWithSlug);
  const price = formatRs(product.priceRs);

  const faqEntries =
    product.faq.length > 0
      ? product.faq
      : STUB_FAQ(product.name, paired?.name ?? "the other serum");

  const timeline =
    product.timelineByWeek.length > 0
      ? product.timelineByWeek
      : TIMELINE_STUB_LABELS.map((label) => ({ label, text: "" }));

  const mechanisms =
    product.whatItDoes.length > 0 ? product.whatItDoes : [null, null, null, null];

  return (
    <main className="pb-24 lg:pb-0">
      <div className="shell-narrow">
        <nav aria-label="Breadcrumb" className="pt-4 text-[0.8rem] text-muted">
          <Link href="/" className="hover:text-ruby">
            Home
          </Link>
          {" / "}
          <Link href="/shop" className="hover:text-ruby">
            Shop
          </Link>
          {" / "}
          <span className="text-ink">{product.name}</span>
        </nav>

        {/* P-01 gallery · P-02 identity · P-03 buy row */}
        <div className="grid grid-cols-1 gap-10 pb-12 pt-7 lg:grid-cols-2 lg:gap-14">
          <ProductGallery
            productName={product.name}
            imageUrls={product.imageUrls}
          />

          <div>
            <span className="text-[0.78rem] uppercase tracking-nav text-muted">
              {product.tagline}
            </span>
            <h1 className="mt-2 font-serif text-[clamp(2rem,4vw,2.6rem)]">
              <ProductName name={product.name} />
            </h1>
            <p className="mt-[0.4rem] text-muted">{product.activesLine}</p>
            <p className="mt-[0.9rem] max-w-[42ch] text-[0.98rem]">
              {product.descriptor}
            </p>

            <div className="mt-6 border-y border-line py-[1.1rem]">
              <div className="flex flex-wrap items-baseline gap-3">
                {price ? (
                  <span className="font-serif text-[1.5rem] text-oxblood">
                    {price}
                  </span>
                ) : (
                  <>
                    <span className="font-serif text-[1.5rem] text-oxblood">
                      Rs.
                    </span>
                    <PendingNote label="Price pending — LAAL to supply" />
                  </>
                )}
              </div>
              <div className="mt-1 text-[0.85rem] text-muted">
                {product.sizeMl} ml · {product.stockLabel}
              </div>

              <AddToCartButton
                slug={product.slug}
                inStock={product.inStock}
                fullWidth
                className="mt-4"
              />
            </div>
          </div>
        </div>

        {/* P-04 short description */}
        <Section label="Short description">
          <div className="mt-4">
            {product.shortDescription ? (
              <p className="max-w-[62ch] text-[0.98rem]">
                {product.shortDescription}
              </p>
            ) : (
              <PendingNote
                variant="block"
                label="Short description pending — LAAL to supply"
                className="max-w-[62ch]"
              />
            )}
          </div>
        </Section>

        {/* P-05 what it does */}
        <Section label="What it does" heading="How the formula works">
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {mechanisms.map((mechanism, index) =>
              mechanism ? (
                <div
                  key={index}
                  className="rounded-card border border-line p-5 text-[0.92rem]"
                >
                  {mechanism}
                </div>
              ) : (
                <PendingNote
                  key={index}
                  variant="block"
                  label={`Mechanism ${index + 1} — pending, LAAL to supply`}
                />
              ),
            )}
          </div>
        </Section>

        {/* P-06 timeline */}
        <Section label="What to expect, and when" heading="Timeline by week">
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {timeline.map((entry) => (
              <div key={entry.label} className="border-t-2 border-ruby pt-[0.9rem]">
                <span className="text-[0.75rem] uppercase tracking-nav text-muted">
                  {entry.label}
                </span>
                <div className="mt-2">
                  {entry.text ? (
                    <p className="text-[0.9rem] text-muted">{entry.text}</p>
                  ) : (
                    <PendingNote label="Pending — LAAL to supply" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* P-07 who it's for / who should wait — both always visible, never behind a tab */}
        <Section label="Who it's for">
          <div className="mt-6 grid grid-cols-1 gap-7 sm:grid-cols-2">
            <div>
              <h3 className="text-[0.95rem] uppercase tracking-[0.06em] text-ruby">
                Who it&rsquo;s for
              </h3>
              <ul className="mt-3 list-disc pl-[1.1rem] text-[0.94rem]">
                <li>{product.whoFor}</li>
              </ul>
            </div>
            <div>
              <h3 className="text-[0.95rem] uppercase tracking-[0.06em] text-muted">
                Who should wait
              </h3>
              <div className="mt-3">
                {product.whoShouldWait ? (
                  <ul className="list-disc pl-[1.1rem] text-[0.94rem]">
                    <li>{product.whoShouldWait}</li>
                  </ul>
                ) : (
                  <PendingNote
                    variant="block"
                    label="Pending — LAAL to supply"
                  />
                )}
              </div>
            </div>
          </div>
        </Section>

        {/* P-08 how to use — real, from LAAL's packaging copy */}
        <Section label="How to use">
          <div className="mt-6 grid grid-cols-1 gap-7 sm:grid-cols-2">
            <div className="rounded-panel border border-line bg-blush p-6">
              <h3 className="text-[1rem] uppercase tracking-[0.08em]">Morning</h3>
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-[0.95rem]">
                {product.howToUseAM.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
            <div className="rounded-panel border border-line bg-blush p-6">
              <h3 className="text-[1rem] uppercase tracking-[0.08em]">Evening</h3>
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-[0.95rem]">
                {product.howToUsePM.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </Section>

        {/* P-09 full INCI — always visible, never collapsed */}
        <Section
          id="ingredients"
          label="Full ingredient list"
          heading="INCI — always visible, never collapsed"
        >
          <div className="mt-6 rounded-panel border border-line bg-blush p-6 text-[0.92rem] leading-[1.75]">
            <p>{product.inciList}</p>
          </div>
        </Section>

        {/* P-10 patch test & storage */}
        <Section label="Patch test & storage">
          <p className="mt-6 max-w-[60ch] text-[0.9rem] text-muted">
            {product.patchTestNote}
          </p>
        </Section>

        {/* P-11 cross-sell */}
        {paired ? (
          <Section label="Pairs with">
            <div className="mt-6 flex max-w-[480px] items-center gap-5 rounded-panel border border-line p-6">
              <BottleMark variant="front" height={96} className="flex-none" />
              <div>
                <span className="text-[0.72rem] uppercase tracking-nav text-muted">
                  {paired.tagline}
                </span>
                <h3 className="mt-[0.2rem] font-serif text-[1.1rem]">
                  <ProductName name={paired.name} />
                </h3>
                <Link
                  href={`/${paired.slug}`}
                  className="mt-[0.4rem] inline-block text-[0.85rem] font-bold text-ruby underline underline-offset-[3px] hover:text-oxblood"
                >
                  View {paired.name} →
                </Link>
              </div>
            </div>
          </Section>
        ) : null}

        {/* P-12 FAQ — the only place the Accordion is used */}
        <Section label="FAQ" heading="Questions about this serum">
          <Accordion className="mt-6">
            {faqEntries.map((entry, index) => (
              <AccordionItem
                key={entry.question}
                question={entry.question}
                defaultOpen={index === 0}
              >
                {entry.answer ? (
                  <p>{entry.answer}</p>
                ) : (
                  <PendingNote label="Answer pending — LAAL to supply" />
                )}
              </AccordionItem>
            ))}
          </Accordion>
        </Section>
      </div>

      {/* Mobile sticky buy bar — right-padded so it clears the floating WhatsApp button. */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-line bg-white py-3 pl-4 pr-[5.5rem] shadow-stickybar lg:hidden">
        <div>
          <div className="font-serif text-[1.15rem] text-oxblood">
            {price ?? "Rs."}
          </div>
          {price ? null : <PendingNote label="Price pending" className="mt-1" />}
          <div className="mt-1 text-[0.8rem] text-muted">{product.sizeMl} ml</div>
        </div>
        <AddToCartButton slug={product.slug} inStock={product.inStock} />
      </div>
    </main>
  );
}

export default ProductPageTemplate;
