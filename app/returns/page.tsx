import type { Metadata } from "next";

import {
  PolicyPage,
  PolicySection,
} from "@/components/policy/PolicyPage";
import { PendingNote } from "@/components/ui/PendingNote";

export const metadata: Metadata = {
  title: "Returns",
  description: "How returns work for LAAL serums.",
};

/**
 * Returns.
 *
 * The hygiene framing is factual and safe to state — a serum applied directly to skin cannot
 * be resold once opened, which is why the distinction between opened and unopened exists at
 * all. The actual terms (window length, refund routing, what counts as faulty) are commercial
 * decisions only LAAL can make, so each one is a <PendingNote> rather than an invented figure.
 */
export default function ReturnsPage() {
  return (
    <PolicyPage
      currentHref="/returns"
      title="Returns"
      intro={
        <p className="text-muted">
          Because our serums are applied directly to skin, opened bottles
          can&rsquo;t be returned for hygiene reasons.
        </p>
      }
    >
      <p className="max-w-[62ch]">
        That restriction is about safety, not small print: once a bottle has been
        opened it can&rsquo;t be verified or resold, so it can&rsquo;t go back
        into stock. Unopened and faulty items are treated differently — the
        specifics below are LAAL&rsquo;s to set.
      </p>

      <PolicySection heading="The terms">
        <ul className="max-w-[60ch] list-disc space-y-3 pl-5 text-[0.95rem]">
          <li>
            Return window:{" "}
            <PendingNote label="Pending — LAAL to supply" />
          </li>
          <li>
            Unopened items:{" "}
            <PendingNote label="Pending — LAAL to supply" />
          </li>
          <li>
            Faulty or damaged on arrival:{" "}
            <PendingNote label="Pending — LAAL to supply" />
          </li>
          <li>
            Refund method: <PendingNote label="Pending — LAAL to supply" /> — no
            card details are ever stored, so refunds route back through the
            original payment method or by bank transfer.
          </li>
        </ul>
      </PolicySection>

      <PolicySection heading="If something arrives wrong">
        <p className="max-w-[62ch] text-[0.95rem]">
          Message LAAL on WhatsApp with your order number and a photo. Reaching
          out before returning anything is always faster than sending it back
          first.
        </p>
      </PolicySection>

      <PolicySection heading="A note on reactions">
        <p className="max-w-[62ch] text-[0.95rem]">
          Every product page carries the full INCI list and patch-test guidance so
          you can check the formula before you buy. If a product irritates your
          skin, stop using it and get in touch.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
