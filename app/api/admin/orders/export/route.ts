import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/types";
import type { OrderStatus, PaymentMethod } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Orders CSV export.
 *
 * Real data, not a stub — every order in the database, one row per order, with its line items
 * flattened into a single column so the file opens cleanly in Excel or Sheets.
 *
 * Auth is checked here, not just in middleware: middleware can only see that a session cookie
 * exists, so a forged cookie reaches this handler and must be rejected by getCurrentAdmin().
 */

/** RFC 4180 escaping — quote every field, double any embedded quotes. */
function csvCell(value: unknown): string {
  if (value === null || value === undefined) return '""';
  return `"${String(value).replace(/"/g, '""')}"`;
}

function csvRow(cells: unknown[]): string {
  return cells.map(csvCell).join(",");
}

const HEADERS = [
  "Order number",
  "Placed at",
  "Status",
  "Customer name",
  "WhatsApp",
  "Email",
  "Address line 1",
  "Address line 2",
  "City",
  "Province",
  "Postal code",
  "Items",
  "Subtotal (Rs)",
  "Discount (Rs)",
  "Delivery (Rs)",
  "Total (Rs)",
  "Payment method",
  "Payment screenshot",
  "Tracking number",
  "Customer notes",
  "Internal notes",
];

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401, headers: { "cache-control": "no-store" } },
    );
  }

  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  const lines = [csvRow(HEADERS)];

  for (const order of orders) {
    const items = order.items
      .map((item) => `${item.quantity} x ${item.productName}`)
      .join("; ");

    lines.push(
      csvRow([
        order.orderNumber,
        order.createdAt.toISOString(),
        ORDER_STATUS_LABELS[order.status as OrderStatus] ?? order.status,
        order.customerName,
        order.customerWhatsapp,
        order.customerEmail,
        order.addressLine1,
        order.addressLine2,
        order.city,
        order.province,
        order.postalCode,
        items,
        order.subtotalRs,
        order.discountRs,
        order.deliveryFeeRs,
        order.totalRs,
        PAYMENT_METHOD_LABELS[order.paymentMethod as PaymentMethod] ??
          order.paymentMethod,
        order.paymentScreenshotUrl,
        order.trackingNumber,
        order.notes,
        order.internalNotes,
      ]),
    );
  }

  const filename = `laal-orders-${new Date().toISOString().slice(0, 10)}.csv`;

  // A BOM makes Excel read the file as UTF-8, so "·" and "–" in product names survive.
  const body = `﻿${lines.join("\r\n")}\r\n`;

  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}
