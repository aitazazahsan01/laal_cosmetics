import Link from "next/link";
import { notFound } from "next/navigation";

import { updateOrderAction } from "@/app/actions/admin/orders";
import { formatRsExact } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  type OrderStatus,
  type PaymentMethod,
} from "@/lib/types";
import {
  AdminPageHeader,
  AdminSubmit,
  Notice,
  Panel,
  StatusBadge,
} from "@/components/admin/AdminUI";

export const dynamic = "force-dynamic";

/**
 * Order detail — the screen staff actually work in.
 *
 * Dispatch notification is deliberately two-channel:
 *  - The WhatsApp button is the primary path and is MANUAL by decision. It opens wa.me for
 *    this customer's number with the order number and tracking number pre-filled, built the
 *    same way as the customer-facing button on the confirmation page.
 *  - sendOrderStatusEmail fires automatically on any status change (see updateOrderAction) as
 *    the fallback, so "we'll notify you by WhatsApp or email" holds even if a staff member
 *    never taps the button.
 */
export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { orderNumber } = await params;
  const { saved } = await searchParams;

  const order = await prisma.order.findUnique({
    where: { orderNumber: decodeURIComponent(orderNumber) },
    include: { items: true, discountCode: true },
  });

  if (!order) notFound();

  const whatsappDigits = order.customerWhatsapp.replace(/[^\d]/g, "");
  // Pakistani local format (03xx…) → international, so wa.me resolves it.
  const internationalNumber = whatsappDigits.startsWith("0")
    ? `92${whatsappDigits.slice(1)}`
    : whatsappDigits;

  const trackingMessage = [
    `Hello ${order.customerName}, your LAAL order ${order.orderNumber} has been dispatched.`,
    order.trackingNumber
      ? `Tracking number: ${order.trackingNumber}`
      : "Tracking number to follow.",
    order.items.map((item) => `${item.quantity} × ${item.productName}`).join(", "),
  ].join("\n");

  const whatsappHref = `https://wa.me/${internationalNumber}?text=${encodeURIComponent(trackingMessage)}`;

  return (
    <>
      <AdminPageHeader
        title={order.orderNumber}
        description={`Placed ${order.createdAt.toISOString().slice(0, 16).replace("T", " ")} · ${
          PAYMENT_METHOD_LABELS[order.paymentMethod as PaymentMethod] ??
          order.paymentMethod
        }`}
        actions={
          <Link
            href="/admin/orders"
            className="rounded border border-line px-4 py-[0.55rem] text-[0.72rem] font-bold uppercase tracking-nav text-oxblood hover:border-ruby hover:text-ruby"
          >
            ← All orders
          </Link>
        }
      />

      {saved ? <Notice>Order updated.</Notice> : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <div className="grid gap-6">
          <Panel title="Customer">
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[0.88rem]">
              <dt className="text-muted">Name</dt>
              <dd>{order.customerName}</dd>
              <dt className="text-muted">WhatsApp</dt>
              <dd>{order.customerWhatsapp}</dd>
              <dt className="text-muted">Email</dt>
              <dd>{order.customerEmail ?? <span className="text-muted">—</span>}</dd>
              <dt className="text-muted">Address</dt>
              <dd>
                {order.addressLine1}
                {order.addressLine2 ? <>, {order.addressLine2}</> : null}
                <br />
                {order.city}, {order.province}
                {order.postalCode ? ` ${order.postalCode}` : ""}
              </dd>
              <dt className="text-muted">Order notes</dt>
              <dd>{order.notes ?? <span className="text-muted">—</span>}</dd>
            </dl>
          </Panel>

          <Panel title="Items">
            <table className="w-full text-[0.88rem]">
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b border-line last:border-0">
                    <td className="py-2">
                      {item.quantity} × {item.productName}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {formatRsExact(item.lineTotalRs)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <dl className="mt-4 grid grid-cols-2 gap-y-1 border-t border-line pt-4 text-[0.88rem]">
              <dt className="text-muted">Subtotal</dt>
              <dd className="text-right tabular-nums">
                {formatRsExact(order.subtotalRs)}
              </dd>
              {order.discountRs > 0 ? (
                <>
                  <dt className="text-muted">
                    Discount{order.discountCode ? ` (${order.discountCode.code})` : ""}
                  </dt>
                  <dd className="text-right tabular-nums text-ruby">
                    −{formatRsExact(order.discountRs)}
                  </dd>
                </>
              ) : null}
              <dt className="text-muted">Delivery</dt>
              <dd className="text-right tabular-nums">
                {formatRsExact(order.deliveryFeeRs)}
              </dd>
              <dt className="font-serif text-oxblood">Total</dt>
              <dd className="text-right font-serif tabular-nums text-oxblood">
                {formatRsExact(order.totalRs)}
              </dd>
            </dl>
          </Panel>

          <Panel title="Payment proof">
            {order.paymentScreenshotUrl ? (
              <>
                <p className="mb-3 text-[0.82rem] text-muted">
                  Served through the authenticated route — this file is not
                  publicly reachable.
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/admin/uploads${order.paymentScreenshotUrl.replace(/^\/uploads/, "")}`}
                  alt={`Payment screenshot for ${order.orderNumber}`}
                  className="max-h-[420px] w-auto rounded border border-line"
                />
                <a
                  href={`/api/admin/uploads${order.paymentScreenshotUrl.replace(/^\/uploads/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-[0.82rem] text-ruby underline underline-offset-[3px]"
                >
                  Open full size →
                </a>
              </>
            ) : (
              <p className="text-[0.88rem] text-muted">
                No screenshot on this order
                {order.paymentMethod === "COD"
                  ? " — Cash on Delivery does not need one."
                  : "."}
              </p>
            )}
          </Panel>
        </div>

        <div className="grid gap-6">
          <Panel title="Fulfilment">
            <div className="mb-4">
              <StatusBadge
                status={order.status}
                label={
                  ORDER_STATUS_LABELS[order.status as OrderStatus] ??
                  order.status
                }
              />
            </div>

            <form action={updateOrderAction} className="grid gap-4">
              <input
                type="hidden"
                name="orderNumber"
                value={order.orderNumber}
              />

              <div>
                <label
                  htmlFor="status"
                  className="mb-[0.35rem] block text-[0.72rem] uppercase tracking-[0.08em] text-muted"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={order.status}
                  className="w-full rounded border border-line bg-white px-3 py-2 text-[0.9rem] focus:border-ruby focus:outline-none"
                >
                  {ORDER_STATUSES.map((value) => (
                    <option key={value} value={value}>
                      {ORDER_STATUS_LABELS[value]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="trackingNumber"
                  className="mb-[0.35rem] block text-[0.72rem] uppercase tracking-[0.08em] text-muted"
                >
                  Tracking number
                </label>
                <input
                  id="trackingNumber"
                  name="trackingNumber"
                  defaultValue={order.trackingNumber ?? ""}
                  className="w-full rounded border border-line bg-white px-3 py-2 text-[0.9rem] focus:border-ruby focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="internalNotes"
                  className="mb-[0.35rem] block text-[0.72rem] uppercase tracking-[0.08em] text-muted"
                >
                  Internal notes
                </label>
                <textarea
                  id="internalNotes"
                  name="internalNotes"
                  rows={4}
                  defaultValue={order.internalNotes ?? ""}
                  className="w-full rounded border border-line bg-white px-3 py-2 text-[0.9rem] focus:border-ruby focus:outline-none"
                />
                <p className="mt-1 text-[0.75rem] text-muted">
                  Staff only — never shown to the customer.
                </p>
              </div>

              <AdminSubmit>Save changes</AdminSubmit>
            </form>
          </Panel>

          <Panel title="Notify the customer">
            {order.status === "DISPATCHED" ? (
              <>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-btn bg-ruby px-5 py-3 text-[0.75rem] font-bold uppercase tracking-button text-white hover:bg-oxblood"
                >
                  Send tracking on WhatsApp
                </a>
                <p className="mt-3 text-[0.78rem] text-muted">
                  Opens WhatsApp to {order.customerWhatsapp} with the order
                  number
                  {order.trackingNumber
                    ? " and tracking number"
                    : " (add a tracking number above to include it)"}{" "}
                  pre-filled. An email notification was already queued
                  automatically when the status changed.
                </p>
              </>
            ) : (
              <p className="text-[0.85rem] text-muted">
                Set the status to <strong>Dispatched</strong> to send tracking on
                WhatsApp. An email notification fires automatically on every
                status change.
              </p>
            )}
          </Panel>

          <Panel title="History">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[0.82rem]">
              <dt className="text-muted">Placed</dt>
              <dd>{order.createdAt.toISOString().slice(0, 16).replace("T", " ")}</dd>
              {(
                [
                  ["Confirmed", order.confirmedAt],
                  ["Dispatched", order.dispatchedAt],
                  ["Delivered", order.deliveredAt],
                  ["Cancelled", order.cancelledAt],
                ] as const
              )
                .filter(([, at]) => Boolean(at))
                .map(([label, at]) => (
                  <div key={label} className="contents">
                    <dt className="text-muted">{label}</dt>
                    <dd>{at!.toISOString().slice(0, 16).replace("T", " ")}</dd>
                  </div>
                ))}
            </dl>
          </Panel>
        </div>
      </div>
    </>
  );
}
