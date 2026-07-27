import type { Metadata } from "next";

import {
  LegalReviewFlag,
  PolicyPage,
  PolicySection,
} from "@/components/policy/PolicyPage";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What LAAL collects, and why.",
};

/**
 * Privacy.
 *
 * The factual inventory below is safe to state — it is simply what the checkout form and the
 * database actually collect, verifiable against prisma/schema.prisma. The privacy policy
 * itself is not drafted here: see LegalReviewFlag.
 */
export default function PrivacyPage() {
  return (
    <PolicyPage
      currentHref="/privacy"
      title="Privacy"
      intro={
        <p className="text-muted">
          What we collect when you order, and what we do not.
        </p>
      }
    >
      <PolicySection heading="What we collect at checkout">
        <ul className="max-w-[60ch] list-disc space-y-2 pl-5 text-[0.95rem]">
          <li>Your name</li>
          <li>Your WhatsApp number, for order updates</li>
          <li>Your email address, only if you choose to give it</li>
          <li>Your delivery address</li>
          <li>Any order notes you add</li>
          <li>
            A payment screenshot, only for Easypaisa, JazzCash and bank transfer
            orders
          </li>
        </ul>
      </PolicySection>

      <PolicySection heading="What we never collect">
        <p className="max-w-[62ch] text-[0.95rem]">
          No card or bank credentials are collected at any point — the site has
          no card fields and no payment gateway. Checkout is guest-only, so there
          is no account and no password to store.
        </p>
      </PolicySection>

      <LegalReviewFlag page="Privacy" />
    </PolicyPage>
  );
}
