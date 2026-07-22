import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  SITE,
  WHATSAPP_CONFIGURED,
  WHATSAPP_NUMBER,
} from "@/lib/config";
import { getOrderByNumber } from "@/lib/orders";
import { formatRsExact } from "@/lib/pricing";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  type OrderStatus,
  type PaymentMethod,
} from "@/lib/types";
import { DemoPricingNote } from "@/components/cart/DemoPricingNote";
import { PendingNote } from "@/components/ui/PendingNote";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order placed",
};

/** The customer-facing progression, in order. Matches the OrderStatus values in the schema. */
const JOURNEY: { status: OrderStatus; blurb: string }[] = [
  { status: "PENDING_PAYMENT", blurb: "We've received your order" },
  { status: "CONFIRMED", blurb: "Payment confirmed" },
  { status: "PACKED", blurb: "Prepared for dispatch" },
  { status: "DISPATCHED", blurb: "Tracking sent via WhatsApp" },
  { status: "DELIVERED", blurb: "To your door" },
];

/**
 * Order confirmation.
 *
 * PRIVACY — order numbers are sequential and therefore guessable, so the full recap (name,
 * address, phone) renders only for the browser that placed the order, identified by the
 * httpOnly `laal_orders` cookie set during checkout. Anyone else opening the URL sees only
 * that the order exists and its status. A signed token on the Order row would be the stronger
 * fix and belongs with the admin work.
 */
export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(decodeURIComponent(orderNumber));

  if (!order) notFound();

  const store = await cookies();
  const owned = (store.get("laal_orders")?.value ?? "")
    .split(",")
    .filter(Boolean)
    .includes(order.orderNumber);

  const currentIndex = Math.max(
    JOURNEY.findIndex((step) => step.status === order.status),
    0,
  );

  const provisionalPricing = order.items.some((item) => item.unitPriceRs === 0);

  const whatsappMessage = [
    `Hello LAAL — I've just placed order ${order.orderNumber}.`,
    order.items
      .map((item) => `${item.quantity} × ${item.productName}`)
      .join(", "),
    `Total: ${formatRsExact(order.totalRs)} · ${PAYMENT_METHOD_LABELS[order.paymentMethod as PaymentMethod] ?? order.paymentMethod}`,
  ].join("\n");

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <main className="mx-auto w-full max-w-[720px] px-5">
      <section className="py-14 text-center">
        <div className="mx-auto mb-5 flex h-[3.4rem] w-[3.4rem] items-center justify-center rounded-full border-2 border-ruby">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8C1C35"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>

        <span className="label">Order placed</span>
        <h1 className="mt-3 font-serif text-[clamp(1.7rem,3.6vw,2.3rem)]">
          Thank you — your order is in.
        </h1>
        <p className="mt-4 font-serif text-[1.15rem] tracking-[0.03em] text-ruby">
          Order {order.orderNumber}
        </p>
        <p className="mt-3 text-[0.95rem] text-muted">
          We&rsquo;ll update you here and on WhatsApp as it moves.
        </p>

        {WHATSAPP_CONFIGURED ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mx-auto mt-7 flex max-w-[360px] items-center justify-center gap-[0.6rem] rounded bg-ruby px-6 py-4 text-[0.85rem] font-bold uppercase tracking-[0.08em] text-white hover:bg-oxblood"
          >
            <WhatsAppIcon />
            Send order to WhatsApp
          </a>
        ) : (
          <div className="mx-auto mt-7 max-w-[420px]">
            <div className="flex items-center justify-center gap-[0.6rem] rounded border border-dashed border-ruby bg-ruby/[0.04] px-6 py-4 text-[0.85rem] font-bold uppercase tracking-[0.08em] text-ruby">
              <WhatsAppIcon />
              Send order to WhatsApp
            </div>
            <PendingNote
              label="WhatsApp number pending — LAAL to supply"
              className="mt-3"
            />
          </div>
        )}

        <p className="mt-3 text-[0.78rem] text-muted">
          One tap — opens WhatsApp with your order number pre-filled.
        </p>
      </section>

      <section className="border-t border-line py-10">
        <h2 className="text-center font-serif text-[1.05rem]">
          What happens next
        </h2>
        <ol className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-5">
          {JOURNEY.map((step, index) => {
            const reached = index <= currentIndex;
            return (
              <li key={step.status} className="text-center">
                <span
                  aria-hidden="true"
                  className={`mx-auto mb-3 block h-[0.7rem] w-[0.7rem] rounded-full ${
                    reached ? "bg-ruby" : "bg-line"
                  }`}
                />
                <h3 className="text-[0.88rem]">
                  {ORDER_STATUS_LABELS[step.status]}
                </h3>
                <p className="mt-1 text-[0.78rem] text-muted">{step.blurb}</p>
                {index === currentIndex ? (
                  <span className="sr-only">(current status)</span>
                ) : null}
              </li>
            );
          })}
        </ol>
      </section>

      <section className="border-t border-line py-9">
        <h2 className="font-serif text-[1.05rem]">Order recap</h2>

        {order.items.map((item) => (
          <div
            key={item.id}
            className="mt-[0.9rem] flex justify-between gap-4 text-[0.9rem]"
          >
            <span>
              {item.quantity} × {item.productName}
            </span>
            <span className="tabular-nums">
              {formatRsExact(item.lineTotalRs)}
            </span>
          </div>
        ))}

        {order.discountRs > 0 ? (
          <div className="mt-[0.9rem] flex justify-between text-[0.9rem] text-ruby">
            <span>Discount</span>
            <span className="tabular-nums">
              −{formatRsExact(order.discountRs)}
            </span>
          </div>
        ) : null}

        <div className="mt-[0.9rem] flex justify-between text-[0.9rem]">
          <span>Delivery</span>
          <span className="tabular-nums">
            {formatRsExact(order.deliveryFeeRs)}
          </span>
        </div>

        <div className="mt-4 flex justify-between border-t border-line pt-4 font-serif text-[1.05rem] text-oxblood">
          <span>Total</span>
          <span className="tabular-nums">{formatRsExact(order.totalRs)}</span>
        </div>

        {provisionalPricing ? <DemoPricingNote className="mt-4" /> : null}

        {owned ? (
          <div className="mt-6 text-[0.85rem] text-muted">
            <p>
              {PAYMENT_METHOD_LABELS[order.paymentMethod as PaymentMethod] ??
                order.paymentMethod}{" "}
              · Delivering to {order.city}
            </p>
            <p className="mt-2">
              {order.customerName}
              <br />
              {order.addressLine1}
              {order.addressLine2 ? (
                <>
                  <br />
                  {order.addressLine2}
                </>
              ) : null}
              <br />
              {order.city}, {order.province}
              <br />
              {order.customerWhatsapp}
            </p>
            {order.notes ? (
              <p className="mt-2 italic">Notes: {order.notes}</p>
            ) : null}
          </div>
        ) : (
          <p className="mt-6 text-[0.85rem] text-muted">
            Delivery details are only shown on the device that placed this
            order. Message {SITE.name} on WhatsApp with the order number if you
            need them.
          </p>
        )}
      </section>

      <div className="pb-16 text-center">
        <Link
          href="/shop"
          className="text-[0.85rem] font-bold text-ruby underline underline-offset-[3px] hover:text-oxblood"
        >
          Continue shopping →
        </Link>
      </div>
    </main>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 20 12a8 8 0 0 1-8 8zm4.4-5.9c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.7-.3-1.4-.7-2-1.3-.5-.5-1-1.1-1.4-1.8-.1-.2 0-.4.1-.5l.4-.4c.1-.1.1-.3.2-.4.1-.1 0-.3 0-.4-.1-.1-.5-1.3-.7-1.8-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.7.7-.9 1.6-.8 2.5.2 1.2.9 2.4 1.9 3.5 1.3 1.5 2.7 2.4 4.5 2.9.5.1 1 .2 1.6.1.6-.1 1.4-.7 1.6-1.3.2-.6.2-1.1.1-1.3-.1-.1-.2-.2-.4-.3z" />
    </svg>
  );
}
