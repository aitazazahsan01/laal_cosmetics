import type { Metadata } from "next";

import {
  PolicyPage,
  PolicySection,
} from "@/components/policy/PolicyPage";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of sale and conditions of use.",
};

/**
 * Terms.
 *
 * "How ordering works" and "Cancellation" describe site mechanics, verifiable against how the
 * site actually behaves. "The products" section below is real, LAAL-supplied terms wording
 * from the Website Content Pack §9 — no longer a placeholder, so LegalReviewFlag has been
 * removed from this page.
 */
export default function TermsPage() {
  return (
    <PolicyPage
      currentHref="/terms"
      title="Terms"
      intro={
        <p className="text-muted">
          Terms of sale and general conditions of use.
        </p>
      }
    >
      <PolicySection heading="How ordering works">
        <ul className="max-w-[60ch] list-disc space-y-2 pl-5 text-[0.95rem]">
          <li>Checkout is guest-only — no account is created or required.</li>
          <li>
            Accepted payment methods are Cash on Delivery, Easypaisa, JazzCash and
            bank transfer.
          </li>
          <li>
            Orders are confirmed once payment is received, or once a COD order is
            verified.
          </li>
          <li>
            Stock is reserved at the moment an order is placed, so an item can sell
            out while you are checking out.
          </li>
        </ul>
      </PolicySection>

      <PolicySection heading="Cancellation">
        <p className="max-w-[62ch] text-[0.95rem]">
          Orders can be cancelled before dispatch by messaging LAAL with your
          order number. Once an order is dispatched, the returns policy applies
          instead.
        </p>
      </PolicySection>

      <PolicySection heading="The products">
        <p className="max-w-[62ch] text-[0.95rem]">
          These are cosmetic products. They are not medicines and they do not
          treat, cure or prevent disease. Patch test before first use.
          Discontinue if irritation occurs. Severe or persistent skin
          conditions need a dermatologist. Prices are in Pakistani Rupees and
          inclusive of applicable taxes.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
