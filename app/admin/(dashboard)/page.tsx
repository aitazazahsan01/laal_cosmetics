import Link from "next/link";

import { formatRsExact } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/types";
import { AdminPageHeader, Panel, StatusBadge } from "@/components/admin/AdminUI";

export const dynamic = "force-dynamic";

export const metadata = { title: "Admin dashboard" };

/** At-a-glance counts, plus the work actually waiting on someone. */
export default async function AdminDashboardPage() {
  const [
    orderCount,
    pendingOrders,
    newStockists,
    newMessages,
    activeDiscounts,
    recentOrders,
    products,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING_PAYMENT" } }),
    prisma.stockistEnquiry.count({ where: { status: "NEW" } }),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.discountCode.count({ where: { isActive: true } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.product.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const stats = [
    { label: "Orders", value: orderCount, href: "/admin/orders" },
    { label: "Awaiting payment", value: pendingOrders, href: "/admin/orders?status=PENDING_PAYMENT" },
    { label: "New stockist enquiries", value: newStockists, href: "/admin/stockists" },
    { label: "Unread messages", value: newMessages, href: "/admin/contact" },
    { label: "Active discount codes", value: activeDiscounts, href: "/admin/discounts" },
  ];

  const missingPrice = products.filter((product) => product.priceRs === null);

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="What needs attention today."
      />

      <div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-card border border-line bg-white p-5 hover:border-ruby"
          >
            <div className="font-serif text-[1.8rem] text-oxblood">
              {stat.value}
            </div>
            <div className="mt-1 text-[0.75rem] uppercase tracking-[0.06em] text-muted">
              {stat.label}
            </div>
          </Link>
        ))}
      </div>

      {missingPrice.length > 0 ? (
        <div className="mb-7 rounded-card border border-dashed border-ruby bg-ruby/[0.05] px-5 py-4 text-[0.88rem] text-ruby">
          <strong>
            {missingPrice.length} product
            {missingPrice.length === 1 ? "" : "s"} still has no price
          </strong>{" "}
          — the storefront is showing provisional Rs. 0 totals and a
          &ldquo;demo pricing&rdquo; note until real prices are set on the{" "}
          <Link href="/admin/products" className="underline">
            products screen
          </Link>
          .
        </div>
      ) : null}

      <Panel title="Recent orders">
        {recentOrders.length === 0 ? (
          <p className="text-[0.9rem] text-muted">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-[0.85rem]">
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-line last:border-0">
                    <td className="py-2 pr-4">
                      <Link
                        href={`/admin/orders/${order.orderNumber}`}
                        className="font-semibold text-ruby hover:text-oxblood"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-2 pr-4">{order.customerName}</td>
                    <td className="py-2 pr-4 tabular-nums">
                      {formatRsExact(order.totalRs)}
                    </td>
                    <td className="py-2">
                      <StatusBadge
                        status={order.status}
                        label={
                          ORDER_STATUS_LABELS[order.status as OrderStatus] ??
                          order.status
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
