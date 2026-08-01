"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { sendOrderStatusEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/types";

/**
 * Updates an order's status, tracking number and internal notes.
 *
 * Status transitions stamp their timestamp column so the order history stays reconstructable.
 * When the status actually changes, the stubbed customer notification fires — see
 * sendOrderStatusEmail for why an email fallback exists alongside the manual WhatsApp step.
 */
export async function updateOrderAction(formData: FormData): Promise<void> {
  // Authoritative check — middleware only proved a cookie was present.
  await requireAdmin();

  const orderNumber = String(formData.get("orderNumber") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "").trim();
  const trackingNumber = String(formData.get("trackingNumber") ?? "").trim();
  const internalNotes = String(formData.get("internalNotes") ?? "").trim();

  if (!orderNumber) redirect("/admin/orders");

  const status = ORDER_STATUSES.includes(statusRaw as OrderStatus)
    ? (statusRaw as OrderStatus)
    : null;

  const existing = await prisma.order.findUnique({ where: { orderNumber } });
  if (!existing) redirect("/admin/orders?error=notfound");

  const statusChanged = status !== null && status !== existing.status;

  const timestamps: Record<string, Date> = {};
  if (statusChanged) {
    if (status === "CONFIRMED" && !existing.confirmedAt) {
      timestamps.confirmedAt = new Date();
    }
    if (status === "DISPATCHED" && !existing.dispatchedAt) {
      timestamps.dispatchedAt = new Date();
    }
    if (status === "DELIVERED" && !existing.deliveredAt) {
      timestamps.deliveredAt = new Date();
    }
    if (status === "CANCELLED" && !existing.cancelledAt) {
      timestamps.cancelledAt = new Date();
    }
  }

  const updated = await prisma.order.update({
    where: { orderNumber },
    data: {
      status: status ?? existing.status,
      trackingNumber: trackingNumber || null,
      internalNotes: internalNotes || null,
      ...timestamps,
    },
  });

  if (statusChanged) {
    // Fire-and-forget: a notification failure must not undo a saved status change.
    try {
      await sendOrderStatusEmail(updated, existing.status);
    } catch (error) {
      console.error("[admin] status email stub failed:", error);
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderNumber}`);

  redirect(`/admin/orders/${orderNumber}?saved=1`);
}
