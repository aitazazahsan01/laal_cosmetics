import { ButtonLink } from "@/components/ui/Button";

/**
 * Several routes in the primary nav (About, Ingredients, Stockists, Contact, the policy
 * pages, cart and checkout) are Phase 2 and land here for now. The copy says so plainly
 * rather than pretending the page is missing.
 */
export default function NotFound() {
  return (
    <main className="shell-narrow py-24">
      <span className="label">404</span>
      <h1 className="mt-3 font-serif text-[clamp(2rem,4vw,2.6rem)]">
        This page isn&rsquo;t here yet.
      </h1>
      <p className="mt-4 max-w-[52ch] text-muted">
        The two serums and the shop are live. The rest of the site is still being
        built.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <ButtonLink href="/shop">Shop the serums</ButtonLink>
        <ButtonLink href="/" variant="secondary">
          Back to home
        </ButtonLink>
      </div>
    </main>
  );
}
