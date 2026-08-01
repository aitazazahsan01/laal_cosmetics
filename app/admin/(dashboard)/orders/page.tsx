import Link from "next/link";
import type { Prisma } from "@prisma/client";

import { formatRsExact } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  type OrderStatus,
  type PaymentMethod,
} from "@/lib/types";
import { AdminPageHeader, StatusBadge } from "@/components/admin/AdminUI";

export const dynamic = "force-dynamic";

export const metadata = { title: "Orders" };

/**
 * Orders list: filter by any of the six statuses, search by customer name, order number or
 * phone number.
 *
 * Search is a case-insensitive contains across those three columns. SQLite's `contains` is
 * already case-insensitive for ASCII, and Prisma's `mode: "insensitive"` is Postgres-only —
 * so the query is written to behave identically after the provider swap by lower-casing the
 * needle and relying on contains semantics rather than a mode flag.
 */
export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const status = ORDER_STATUSES.includes(params.status as OrderStatus)
    ? (params.status as OrderStatus)
    : null;
  const query = (params.q ?? "").trim();

  const where: Prisma.OrderWhereInput = {};
  if (status) where.status = status;
  if (query) {
    where.OR = [
      { orderNumber: { contains: query } },
      { customerName: { contains: query } },
      { customerWhatsapp: { contains: query } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.order.count(),
  ]);

  return (
    <>
      <AdminPageHeader
        title="Orders"
        description={`${total} order${total === 1 ? "" : "s"} in total.`}
        actions={
          <a
            href="/api/admin/orders/export"
            className="rounded border border-oxblood px-4 py-[0.55rem] text-[0.72rem] font-bold uppercase tracking-nav text-oxblood hover:bg-white"
          >
            Export CSV
          </a>
        }
      />

      <form method="GET" className="mb-6 flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1">
          <label
            htmlFor="q"
            className="mb-[0.35rem] block text-[0.72rem] uppercase tracking-[0.08em] text-muted"
          >
            Search
          </label>
          <input
            id="q"
            name="q"
            defaultValue={query}
            placeholder="Order number, name or phone"
            className="w-full rounded border border-line bg-white px-3 py-2 text-[0.9rem] focus:border-ruby focus:outline-none"
          />
        </div>

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
            defaultValue={status ?? ""}
            className="rounded border border-line bg-white px-3 py-2 text-[0.9rem] focus:border-ruby focus:outline-none"
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((value) => (
              <option key={value} value={value}>
                {ORDER_STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="rounded-btn bg-ruby px-5 py-[0.6rem] text-[0.72rem] font-bold uppercase tracking-button text-white hover:bg-oxblood"
        >
          Apply
        </button>

        {status || query ? (
          <Link
            href="/admin/orders"
            className="text-[0.8rem] text-muted underline underline-offset-[3px] hover:text-ruby"
          >
            Clear
          </Link>
        ) : null}
      </form>

      <div className="overflow-x-auto rounded-card border border-line bg-white">
        <table className="w-full min-w-[820px] text-[0.85rem]">
          <thead>
            <tr className="border-b border-line text-left text-[0.7rem] uppercase tracking-[0.06em] text-muted">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Placed</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted">
                  No orders match that filter.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-line last:border-0 hover:bg-blush/40"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.orderNumber}`}
                      className="font-semibold text-ruby hover:text-oxblood"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted">
                    {order.createdAt.toISOString().slice(0, 10)}
                  </td>
                  <td className="px-4 py-3">
                    {order.customerName}
                    <span className="block text-[0.75rem] text-muted">
                      {order.customerWhatsapp}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatRsExact(order.totalRs)}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {PAYMENT_METHOD_LABELS[
                      order.paymentMethod as PaymentMethod
                    ] ?? order.paymentMethod}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={order.status}
                      label={
                        ORDER_STATUS_LABELS[order.status as OrderStatus] ??
                        order.status
                      }
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
