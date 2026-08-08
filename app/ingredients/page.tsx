import type { Metadata } from "next";
import Link from "next/link";

import { deriveActives, formatOccurrences } from "@/lib/ingredients";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { PendingNote } from "@/components/ui/PendingNote";
import { ProductName } from "@/components/ui/ProductName";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  // `absolute` bypasses the root layout's "%s — LAAL" title template.
  title: { absolute: "Every Ingredient, Explained | LAAL" },
  description:
    "The full INCI of both LAAL serums with a plain-language explanation of what each ingredient does and why it is there.",
};

/**
 * Ingredients.
 *
 * The actives list is DERIVED from the seeded INCI lists and actives lines (lib/ingredients.ts)
 * rather than typed out here — which product each active appears in, and at what stated
 * concentration, is read from the data. What each active *does* is a <PendingNote>: naming an
 * ingredient is factual, explaining its effect is a claim, and claims are LAAL's to make.
 *
 * Both full INCI lists and both patch-test notes render as plain always-visible sections,
 * never collapsed — same rule as the product pages.
 */
export default async function IngredientsPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const actives = deriveActives(products);

  return (
    <main className="mx-auto w-full max-w-[1000px] px-5">
      <PageHeader
        label="Ingredients"
        heading="Every active, plainly explained. Every ingredient, fully listed."
        lede={
          <p className="text-muted">
            What each active does is LAAL&rsquo;s to explain — the actives
            themselves and both full INCI lists are already fixed on the approved
            packaging artwork, so they are accurate here today.
          </p>
        }
      />

      <section className="border-t border-line py-10">
        <span className="label">The actives</span>
        <h2 className="mt-1 font-serif text-[1.4rem]">Across both serums</h2>

        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {actives.map((active) => (
            <div
              key={active.inci}
              className="rounded-card border border-line p-6"
            >
              <div className="font-serif text-[1.05rem] text-oxblood">
                {active.displayName}
              </div>
              <div className="mt-1 text-[0.76rem] uppercase tracking-[0.05em] text-muted">
                {formatOccurrences(active)}
              </div>
              <p className="mt-3">
                <PendingNote label="Plain-language explanation pending — LAAL to supply" />
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-line py-10">
        <span className="label">Full ingredient lists</span>
        <h2 className="mt-1 font-serif text-[1.4rem]">
          INCI, both products, always visible
        </h2>

        <div className="mt-7 grid grid-cols-1 gap-6 md:grid-cols-2">
          {products.map((product) => (
            <div
              key={product.slug}
              className="rounded-panel border border-line bg-blush p-7"
            >
              <span className="text-[0.72rem] uppercase tracking-nav text-muted">
                {product.tagline}
              </span>
              <h3 className="mt-[0.3rem] font-serif text-[1.2rem]">
                <Link href={`/${product.slug}`} className="hover:text-ruby">
                  <ProductName name={product.name} />
                </Link>
              </h3>

              <p className="mt-4 text-[0.9rem] leading-[1.75]">
                {product.inciList}
              </p>

              <p className="mt-5 border-t border-line pt-4 text-[0.8rem] text-muted">
                {product.patchTestNote}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
