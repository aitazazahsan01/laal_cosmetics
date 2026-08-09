import type { Metadata } from "next";

import { getProducts } from "@/lib/products";
import { ProductCard } from "@/components/product/ProductCard";
import { ButtonLink } from "@/components/ui/Button";
import { TrustBadge, type TrustBadgeIconRef } from "@/components/ui/TrustBadge";

// Stock and catalogue content come straight from the database on every request.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  // `absolute` bypasses the root layout's "%s — LAAL" title template — this exact string is
  // the content pack's SEO title tag, and must not get "— LAAL" appended a second time.
  title: { absolute: "LAAL — Skincare, Studied | Serums Made in Pakistan" },
  description:
    "Two serums with every ingredient printed and every active named at the concentration used. Independently tested at PCSIR. No fairness claims.",
};

/**
 * Home.
 *
 * Content provenance, section by section:
 *  - Hero headline, supporting line and buttons: real, approved copy from the LAAL Website
 *    Content Pack §4.
 *  - Hero image: an AI-rendered product mockup (docs/brand/LAAL_Website_Content_Pack.pdf
 *    §13.2 — real photography replaces it once the first batch arrives).
 *  - Trust strip (below hero) and "Why LAAL": real copy from the Content Pack §4.
 *  - Product cards: live from the database.
 *  - "How to order" and the bottom trust strip: factual site mechanics from the SRS (guest
 *    checkout, four payment methods, WhatsApp tracking, COD nationwide, full INCI on every
 *    product, patch-test guidance). Safe to state.
 *  - Closing block: real copy from the Content Pack §4.
 */

const HERO_TRUST_POINTS: { icon: TrustBadgeIconRef; lead: string; body: string }[] = [
  {
    icon: { image: "/brand/flask.jpg", alt: "Independently tested" },
    lead: "Independently tested.",
    body: "Both serums tested at PCSIR Laboratories, Islamabad. Mercury: not detectable.",
  },
  {
    icon: "document",
    lead: "Every ingredient printed.",
    body: "Full INCI on every bottle, every box and every product page.",
  },
  {
    icon: "ban",
    lead: "No fairness claims. Ever.",
    body: "We do not sell skin lightening, and we never will.",
  },
];

const WHY_LAAL = [
  {
    lead: "We name the concentration.",
    body: 'Niacinamide 5%. Zinc PCA 0.5%. Not "contains niacinamide" — the actual number, because the number is what decides whether it works.',
  },
  {
    lead: "We tested it before we sold it.",
    body: "Both formulations went to a government laboratory before a single bottle was sold. Patch test negative. Mercury not detectable. Report available on request.",
  },
  {
    lead: "We tell you who it is not for.",
    body: "Every product page says who should wait. A brand that only tells you the good part is telling you half of it.",
  },
];

const HOW_TO_ORDER = [
  {
    title: "Choose your serum",
    body: "Add to cart from the product page or Shop — your cart stays saved if you leave and come back.",
  },
  {
    title: "Checkout as a guest",
    body: "Name, address and phone number — pay by Cash on Delivery, Easypaisa, JazzCash or bank transfer.",
  },
  {
    title: "Track on WhatsApp",
    body: "Order confirmation on screen, then a WhatsApp update with tracking once it's dispatched.",
  },
];

const TRUST_POINTS = [
  "Full ingredient list on every product",
  "Guest checkout — no account needed",
  "Cash on delivery, nationwide",
  "Patch-test guidance on every bottle",
];

export default async function HomePage() {
  const products = await getProducts();

  return (
    <main>
      {/* Hero */}
      <section className="border-b border-line bg-blush">
        <div className="mx-auto grid max-w-shell grid-cols-1 items-center gap-10 px-5 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div>
            <span className="label">LAAL · Pakistani skincare</span>
            <h1 className="mt-4 max-w-[15ch] font-serif text-[clamp(2.1rem,5vw,3.4rem)] leading-[1.14]">
              Skincare, studied.
            </h1>

            <div className="mt-5 max-w-[46ch] border-l-2 border-dashed border-ruby pl-4">
              <p className="text-[1.08rem]">
                Two serums. Every ingredient printed. Every active named at
                the concentration it is used.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="/shop">Shop the serums</ButtonLink>
              <ButtonLink href="/ingredients" variant="secondary">
                Read the ingredients
              </ButtonLink>
            </div>
          </div>

          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/niacinamide-2.png"
              alt="LAAL Niacinamide+ serum"
              className="max-h-[420px] w-auto object-contain"
            />
          </div>
        </div>
      </section>

      {/* Trust strip — directly under the hero, three short items, icon-forward so it can't
          be skimmed past. Copy is unchanged from the previous plain-text version. */}
      <section className="border-b border-line">
        <div className="shell grid grid-cols-1 gap-6 py-12 md:grid-cols-3">
          {HERO_TRUST_POINTS.map((point) => (
            <TrustBadge
              key={point.lead}
              icon={point.icon}
              heading={point.lead}
              body={point.body}
            />
          ))}
        </div>
      </section>

      {/* The serums */}
      <section className="py-section" id="products">
        <div className="shell">
          <div className="mb-9">
            <span className="label">The serums</span>
            <h2 className="mt-3 max-w-[22ch] font-serif text-[clamp(1.6rem,3vw,2.1rem)]">
              Two formulas, two concerns, nothing else in between.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Why LAAL */}
      <section
        id="why-laal"
        className="border-y border-line bg-blush py-section"
      >
        <div className="shell">
          <div className="mb-8">
            <span className="label">Why LAAL</span>
            <h2 className="mt-3 max-w-[22ch] font-serif text-[clamp(1.6rem,3vw,2.1rem)]">
              Why LAAL
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {WHY_LAAL.map((point) => (
              <div key={point.lead} className="border-t-2 border-ruby pt-4">
                <h3 className="text-[1.02rem] font-bold">{point.lead}</h3>
                <p className="mt-2 text-[0.92rem] text-muted">{point.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to order — real site mechanics */}
      <section className="py-section">
        <div className="shell">
          <div className="mb-9">
            <span className="label">How to order</span>
            <h2 className="mt-3 max-w-[22ch] font-serif text-[clamp(1.6rem,3vw,2.1rem)]">
              Three steps, no account required.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {HOW_TO_ORDER.map((step, index) => (
              <div key={step.title} className="relative pl-12">
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-[-0.2rem] font-serif text-[2.1rem] leading-none text-ruby"
                >
                  {index + 1}
                </span>
                <h3 className="text-[1.05rem]">{step.title}</h3>
                <p className="mt-2 max-w-[30ch] text-[0.92rem] text-muted">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip — all factual */}
      <section className="border-y border-line">
        <div className="shell grid grid-cols-1 gap-6 py-9 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_POINTS.map((point) => (
            <div key={point} className="flex items-start gap-3 text-[0.86rem]">
              <span
                aria-hidden="true"
                className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-ruby"
              />
              <span>{point}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Closing block — real copy, Content Pack §4 */}
      <section className="border-t border-line py-section">
        <div className="shell">
          <div className="mx-auto max-w-[62ch] text-center">
            <h2 className="font-serif text-[clamp(1.6rem,3vw,2.1rem)]">
              Two products. That is the whole range.
            </h2>
            <p className="mt-4 text-[1rem] text-muted">
              One treats. One repairs. Together they are a complete routine,
              and we would rather do two things properly than ten things
              adequately.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
