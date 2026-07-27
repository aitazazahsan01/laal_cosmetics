import type { Metadata } from "next";

import {
  LegalReviewFlag,
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
 * Only the mechanics are described — guest checkout, the four payment methods, how an order
 * moves through its statuses — all verifiable against how the site actually behaves. The
 * terms of sale themselves are not drafted here: see LegalReviewFlag.
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

      <LegalReviewFlag page="Terms" />
    </PolicyPage>
  );
}
