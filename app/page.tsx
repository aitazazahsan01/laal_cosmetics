import { getProducts } from "@/lib/products";
import { ProductCard } from "@/components/product/ProductCard";
import { BottleMark } from "@/components/ui/BottleMark";
import { ButtonLink } from "@/components/ui/Button";
import { PendingNote } from "@/components/ui/PendingNote";

// Stock and catalogue content come straight from the database on every request.
export const dynamic = "force-dynamic";

/**
 * Home.
 *
 * Content provenance, section by section:
 *  - Hero headline: LAAL's own approved packaging copy ("Every ingredient printed. Every
 *    active named."). Real.
 *  - Hero supporting line: carried over from the Phase A mockup, where it was flagged as
 *    draft pending LAAL approval — so it keeps its pending marker here.
 *  - Product cards: live from the database.
 *  - "Why LAAL": LAAL has supplied nothing for this section. Three <PendingNote> slots, no
 *    invented brand claims.
 *  - "How to order" and the trust strip: factual site mechanics from the SRS (guest
 *    checkout, four payment methods, WhatsApp tracking, COD nationwide, full INCI on every
 *    product, patch-test guidance). Safe to state.
 */

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
              Every ingredient printed.
              <br />
              Every active named.
            </h1>

            <div className="mt-5 max-w-[46ch] border-l-2 border-dashed border-ruby pl-4">
              <p className="text-[1.08rem]">
                Two serums, full ingredient lists, guest checkout, delivered
                nationwide.
              </p>
              <PendingNote
                label="Draft — LAAL to approve"
                className="mt-2"
              />
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="/shop">Shop the serums</ButtonLink>
              <ButtonLink href="#why-laal" variant="secondary">
                Why LAAL
              </ButtonLink>
            </div>
          </div>

          <div className="flex justify-center">
            <BottleMark
              variant="front"
              height={380}
              title="Illustration of a LAAL serum bottle — product photography pending"
            />
          </div>
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

      {/* Why LAAL — nothing supplied yet */}
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
            <p className="mt-4 max-w-[52ch] text-[0.95rem] text-muted">
              This section is reserved for LAAL&rsquo;s own words. Nothing is
              written here on the brand&rsquo;s behalf.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[1, 2, 3].map((point) => (
              <div key={point} className="border-t-2 border-ruby pt-4">
                <PendingNote
                  variant="block"
                  label={`Point ${point} — pending, LAAL to supply`}
                />
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
    </main>
  );
}
