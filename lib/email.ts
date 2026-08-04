import type {
  AdminUser,
  ContactMessage,
  Order,
  OrderItem,
  StockistEnquiry,
} from "@prisma/client";

/**
 * Order notification email.
 *
 * DELIBERATE NO-OP. There is no email provider wired up yet, so this logs and returns
 * instead of sending. It is called at the correct point in the order-creation flow
 * (lib/orders.ts, immediately after the order transaction commits) so the integration point
 * is real and correct — only the implementation is missing.
 *
 * TODO: wire to Resend once RESEND_API_KEY exists. Replace the body of this function with a
 * Resend call; the signature and call site should not need to change. Two messages are
 * expected then: one to LAAL with the order detail, and one to the customer if they supplied
 * an email address (it is optional at checkout).
 *
 * Failures here must never fail the order — the customer has already paid or committed to
 * COD by this point, so this is intentionally fire-and-forget at the call site.
 */

export type OrderWithItems = Order & { items: OrderItem[] };

export async function sendOrderNotificationEmail(
  order: OrderWithItems,
): Promise<{ sent: boolean; reason?: string }> {
  const recipientCount = order.customerEmail ? 2 : 1;

  console.info(
    `[email] stub — would notify ${recipientCount} recipient(s) about ${order.orderNumber}` +
      ` (${order.items.length} item(s), total Rs. ${order.totalRs}).`,
  );

  return { sent: false, reason: "No email provider configured yet." };
}

/**
 * Stockist / wholesale enquiry notification.
 *
 * Same deliberate no-op, same integration point: called from the stockist server action
 * immediately after the StockistEnquiry row is committed.
 *
 * TODO: wire to Resend once RESEND_API_KEY exists. This one goes to LAAL only — a stockist
 * enquiry is a lead, not a transaction, and no confirmation is promised to the sender beyond
 * the on-screen acknowledgement.
 *
 * Must never include pricing: the SRS forbids wholesale pricing from appearing publicly, and
 * that extends to anything generated off a public form.
 */
export async function sendStockistEnquiryEmail(
  enquiry: StockistEnquiry,
): Promise<{ sent: boolean; reason?: string }> {
  console.info(
    `[email] stub — would notify LAAL of stockist enquiry ${enquiry.id}` +
      ` from ${enquiry.businessName} (${enquiry.businessType ?? "type not given"}, ${enquiry.city}).`,
  );

  return { sent: false, reason: "No email provider configured yet." };
}

/**
 * General contact-form notification.
 *
 * Kept separate from the stockist notification on purpose — different audience, different
 * triage, and the two will want different templates once a provider is wired up.
 *
 * TODO: wire to Resend once RESEND_API_KEY exists.
 */
export async function sendContactMessageEmail(
  contact: ContactMessage,
): Promise<{ sent: boolean; reason?: string }> {
  console.info(
    `[email] stub — would notify LAAL of contact message ${contact.id} from ${contact.email}.`,
  );

  return { sent: false, reason: "No email provider configured yet." };
}

/**
 * Order status change notification to the customer.
 *
 * Called from the admin order screen whenever status changes. This is the fallback channel:
 * dispatch tracking is sent by a staff member tapping the WhatsApp button, which is a manual
 * step and can be skipped, so "we'll notify you by WhatsApp or email" still needs an email
 * path to be true.
 *
 * TODO: wire to Resend once RESEND_API_KEY exists. Only send when order.customerEmail is
 * present — email is optional at checkout.
 */
export async function sendOrderStatusEmail(
  order: Order,
  previousStatus: string,
): Promise<{ sent: boolean; reason?: string }> {
  if (!order.customerEmail) {
    console.info(
      `[email] stub — ${order.orderNumber} moved ${previousStatus} → ${order.status};` +
        " no customer email on file, WhatsApp only.",
    );
    return { sent: false, reason: "No customer email on this order." };
  }

  console.info(
    `[email] stub — would tell ${order.customerEmail} that ${order.orderNumber} moved` +
      ` ${previousStatus} → ${order.status}` +
      (order.trackingNumber ? ` (tracking ${order.trackingNumber}).` : "."),
  );

  return { sent: false, reason: "No email provider configured yet." };
}

/**
 * Admin password reset.
 *
 * The raw token only ever exists in this message and in the recipient's URL — the database
 * stores its hash. The token is deliberately NOT logged, even in this stub, so the dev
 * console cannot be used to take over an account.
 *
 * TODO: wire to Resend once RESEND_API_KEY exists.
 */
export async function sendPasswordResetEmail(
  admin: AdminUser,
  _resetUrl: string,
): Promise<{ sent: boolean; reason?: string }> {
  console.info(
    `[email] stub — would send a password reset link to ${admin.email} (link withheld from logs).`,
  );

  return { sent: false, reason: "No email provider configured yet." };
}
