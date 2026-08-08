import type { Metadata } from "next";

import { getDeliverySettings, formatRs } from "@/lib/products";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/types";
import {
  PolicyPage,
  PolicySection,
} from "@/components/policy/PolicyPage";
import { PendingNote } from "@/components/ui/PendingNote";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shipping",
  description: "How LAAL delivers, nationwide across Pakistan.",
};

/**
 * Shipping.
 *
 * The structural content here is factual site mechanics from the SRS — nationwide delivery,
 * the six order statuses, WhatsApp/email dispatch notification — and is safe to state, the
 * same rule the Home page's "how to order" section follows.
 *
 * The actual amounts are not: the delivery fee, the free-delivery threshold and the COD
 * surcharge are all still null in DeliverySettings, so they render as <PendingNote> and the
 * page reads live from the database rather than restating a number that could go stale.
 */
export default async function ShippingPage() {
  const delivery = await getDeliverySettings();

  const standardFee = formatRs(delivery?.standardFeeRs ?? null);
  const threshold = formatRs(delivery?.freeDeliveryThresholdRs ?? null);
  const hasEstimate =
    delivery?.estimatedDaysMin != null && delivery?.estimatedDaysMax != null;

  return (
    <PolicyPage
      currentHref="/shipping"
      title="Shipping"
      intro={
        <p className="text-muted">
          Pakistan-wide delivery in 3–5 working days from confirmed payment,
          with Cash on Delivery available in major cities.
        </p>
      }
    >
      <p className="max-w-[62ch]">
        Every order gets a unique order number and a status you can follow. Once
        your order is dispatched you&rsquo;ll get a WhatsApp update — or an email
        if you gave us one — with your tracking number.
      </p>

      <PolicySection heading="Order statuses">
        <ol className="max-w-[60ch] list-decimal space-y-2 pl-5 text-[0.95rem]">
          {ORDER_STATUSES.map((status) => (
            <li key={status}>{ORDER_STATUS_LABELS[status]}</li>
          ))}
        </ol>
      </PolicySection>

      <PolicySection heading="Delivery charges">
        <ul className="max-w-[60ch] list-disc space-y-2 pl-5 text-[0.95rem]">
          <li>
            Standard delivery charge:{" "}
            {standardFee ?? <PendingNote label="Pending — LAAL to supply" />}
          </li>
          <li>
            Free delivery above:{" "}
            {threshold ?? <PendingNote label="Pending — LAAL to supply" />}
          </li>
          <li>
            A small surcharge may apply to Cash on Delivery orders. Any surcharge
            is included in the total shown before you place the order — never
            added afterwards.
          </li>
        </ul>
      </PolicySection>

      <PolicySection heading="Delivery times">
        {hasEstimate ? (
          <p className="max-w-[62ch] text-[0.95rem]">
            Orders typically arrive within {delivery?.estimatedDaysMin}–
            {delivery?.estimatedDaysMax} working days of dispatch.
          </p>
        ) : (
          <PendingNote
            variant="block"
            label="Estimated delivery windows pending — LAAL to supply"
            className="max-w-[62ch]"
          />
        )}
      </PolicySection>

      <PolicySection heading="Payment">
        <p className="max-w-[62ch] text-[0.95rem]">
          We accept Cash on Delivery, Easypaisa, JazzCash and bank transfer. No
          card details are collected at any point. For the three non-COD methods
          you can upload a payment screenshot at checkout, or send it on WhatsApp
          afterwards.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
