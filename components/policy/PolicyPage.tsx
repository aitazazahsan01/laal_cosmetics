import Link from "next/link";
import type { ReactNode } from "react";

import { PageHeader } from "@/components/layout/PageHeader";

/**
 * Shared layout for the four policy pages.
 *
 * One template, four routes — /shipping, /returns, /privacy and /terms each pass their own
 * content, so structure and typography can never drift apart between them.
 */

export const POLICY_LINKS = [
  { href: "/shipping", label: "Shipping" },
  { href: "/returns", label: "Returns" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

/**
 * The block used on Privacy and Terms.
 *
 * These two pages are legal text, not layout. Drafting them here would produce something that
 * looks authoritative but has had no legal review, which is worse than an obvious gap — so
 * the template is built and the wording is explicitly left to LAAL.
 */
export function LegalReviewFlag({ page }: { page: string }) {
  return (
    <div className="mt-7 max-w-[62ch] rounded-card border border-dashed border-ruby bg-ruby/[0.05] p-5 text-[0.88rem]">
      <strong className="text-oxblood">Not drafted here, on purpose.</strong>{" "}
      {page} is legal text and should come from whoever handles LAAL&rsquo;s
      legal and compliance sign-off — not from page-layout drafting. The
      template and structure are ready; the wording is not ours to guess at.
    </div>
  );
}

export function PolicySection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="font-serif text-[1.05rem]">{heading}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function PolicyPage({
  title,
  intro,
  children,
  currentHref,
}: {
  title: string;
  intro?: ReactNode;
  children: ReactNode;
  currentHref: string;
}) {
  return (
    <main className="mx-auto w-full max-w-[760px] px-5 pb-20">
      <PageHeader label="Policy" heading={title} lede={intro} />

      <nav aria-label="Policies" className="flex flex-wrap gap-3 pb-2">
        {POLICY_LINKS.map((link) => {
          const isCurrent = link.href === currentHref;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isCurrent ? "page" : undefined}
              className={`rounded-full border px-4 py-[0.45rem] text-[0.8rem] font-semibold ${
                isCurrent
                  ? "border-ruby bg-ruby text-white"
                  : "border-line text-ink hover:border-ruby hover:text-ruby"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line pt-6 text-[0.98rem]">{children}</div>
    </main>
  );
}

export default PolicyPage;
