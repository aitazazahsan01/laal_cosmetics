import type {
  AdminUser,
  ContactMessage,
  Order,
  OrderItem,
  StockistEnquiry,
} from "@prisma/client";
import { Resend } from "resend";

import { SITE } from "@/lib/config";

/**
 * Email, via Resend.
 *
 * Every function here follows the same rule as every other integration in this codebase: it
 * is wired to the correct call site and does the correct thing when its required env vars
 * exist, and falls back to the exact previous console.info no-op when they don't — never a
 * crash, never a fake send.
 *
 * Required vars, per function (see .env.example for the TODO placeholders):
 *  - RESEND_API_KEY + EMAIL_FROM are needed for ANY real send.
 *  - ADMIN_NOTIFICATION_EMAIL is additionally needed for the LAAL-directed half of any
 *    function that notifies LAAL (order notification, stockist enquiry, contact message).
 *  - Functions that email the customer (order notification's customer half, order status)
 *    only need RESEND_API_KEY + EMAIL_FROM — the recipient is real DB data
 *    (order.customerEmail), not an env var.
 *
 * Failures from Resend must never throw past these functions — every call site treats email
 * as fire-and-forget, exactly as it did with the stub.
 */

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM;
const adminNotificationEmail = process.env.ADMIN_NOTIFICATION_EMAIL;

/** True once the minimum pair needed to send anything at all exists. */
const CAN_SEND = Boolean(resendApiKey && emailFrom);

/** True once LAAL also has a receiving address for LAAL-directed notifications. */
const CAN_NOTIFY_ADMIN = CAN_SEND && Boolean(adminNotificationEmail);

let resendClient: Resend | null = null;
function getResend(): Resend {
  if (!resendClient) resendClient = new Resend(resendApiKey);
  return resendClient;
}

/** Shared, minimal on-brand wrapper — a heading, the facts, no invented claims or voice. */
function renderEmail(heading: string, bodyHtml: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#F7EFEF;font-family:Georgia,'Times New Roman',serif;color:#1A1A1A;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:520px;background:#FFFFFF;border:1px solid #E7DADA;border-radius:6px;">
            <tr>
              <td style="padding:28px 32px 8px 32px;">
                <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#8C1C35;font-weight:bold;">${SITE.name}</div>
                <h1 style="font-size:20px;margin:12px 0 0 0;color:#1A1A1A;">${heading}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 28px 32px;font-size:14px;line-height:1.6;color:#1A1A1A;">
                ${bodyHtml}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function trySend(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ sent: boolean; reason?: string }> {
  try {
    const { error } = await getResend().emails.send({
      from: emailFrom as string,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    if (error) {
      console.error("[email] Resend send failed:", error);
      return { sent: false, reason: "Email provider rejected the send." };
    }
    return { sent: true };
  } catch (error) {
    console.error("[email] Resend send threw:", error);
    return { sent: false, reason: "Email provider request failed." };
  }
}

export type OrderWithItems = Order & { items: OrderItem[] };

function orderItemsHtml(items: OrderItem[]): string {
  const rows = items
    .map(
      (item) =>
        `<tr><td style="padding:4px 0;">${item.productName} × ${item.quantity}</td><td style="padding:4px 0;text-align:right;">Rs. ${item.lineTotalRs.toLocaleString("en-PK")}</td></tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" style="border-top:1px solid #E7DADA;margin-top:12px;padding-top:8px;">${rows}</table>`;
}

/**
 * Order notification email.
 *
 * Two independently-gated halves: LAAL always wants to know about a new order
 * (needs ADMIN_NOTIFICATION_EMAIL), and the customer gets a copy only if they supplied an
 * email at checkout (optional field) — sending one half does not require the other's
 * prerequisite to also be met.
 *
 * Called at the correct point in the order-creation flow (lib/orders.ts, immediately after
 * the order transaction commits). Failures here must never fail the order — the customer has
 * already paid or committed to COD by this point, so this is intentionally fire-and-forget at
 * the call site.
 */
export async function sendOrderNotificationEmail(
  order: OrderWithItems,
): Promise<{ sent: boolean; reason?: string }> {
  const wantsCustomerCopy = Boolean(order.customerEmail);
  const recipientCount = wantsCustomerCopy ? 2 : 1;

  const canSendAdmin = CAN_NOTIFY_ADMIN;
  const canSendCustomer = CAN_SEND && wantsCustomerCopy;

  if (!canSendAdmin && !canSendCustomer) {
    console.info(
      `[email] stub — would notify ${recipientCount} recipient(s) about ${order.orderNumber}` +
        ` (${order.items.length} item(s), total Rs. ${order.totalRs}).`,
    );
    return { sent: false, reason: "No email provider configured yet." };
  }

  const results: { sent: boolean; reason?: string }[] = [];

  if (canSendAdmin) {
    results.push(
      await trySend({
        to: adminNotificationEmail as string,
        subject: `New order ${order.orderNumber}`,
        html: renderEmail(
          `New order — ${order.orderNumber}`,
          `<p>${order.customerName} · ${order.customerWhatsapp}${order.customerEmail ? ` · ${order.customerEmail}` : ""}</p>
           <p>${order.addressLine1}${order.addressLine2 ? `, ${order.addressLine2}` : ""}, ${order.city}, ${order.province}</p>
           <p>Payment method: ${order.paymentMethod}</p>
           ${orderItemsHtml(order.items)}
           <p style="margin-top:12px;font-weight:bold;">Total: Rs. ${order.totalRs.toLocaleString("en-PK")}</p>`,
        ),
      }),
    );
  } else {
    console.info(
      `[email] stub — would notify LAAL about ${order.orderNumber}; ADMIN_NOTIFICATION_EMAIL not set.`,
    );
  }

  if (canSendCustomer) {
    results.push(
      await trySend({
        to: order.customerEmail as string,
        subject: `Your ${SITE.name} order ${order.orderNumber}`,
        html: renderEmail(
          `Thanks for your order, ${order.customerName}.`,
          `<p>Order ${order.orderNumber} has been received.</p>
           ${orderItemsHtml(order.items)}
           <p style="margin-top:12px;font-weight:bold;">Total: Rs. ${order.totalRs.toLocaleString("en-PK")}</p>
           <p>We'll update you by WhatsApp or email as your order moves.</p>`,
        ),
      }),
    );
  } else if (wantsCustomerCopy) {
    console.info(
      `[email] stub — would notify ${order.customerEmail} about ${order.orderNumber}; email provider not configured.`,
    );
  }

  const sent = results.some((result) => result.sent);
  return sent
    ? { sent: true }
    : { sent: false, reason: results[0]?.reason ?? "No email provider configured yet." };
}

/**
 * Stockist / wholesale enquiry notification.
 *
 * LAAL-directed only — a stockist enquiry is a lead, not a transaction, and no confirmation is
 * promised to the sender beyond the on-screen acknowledgement.
 *
 * Must never include pricing: the SRS forbids wholesale pricing from appearing publicly, and
 * that extends to anything generated off a public form.
 */
export async function sendStockistEnquiryEmail(
  enquiry: StockistEnquiry,
): Promise<{ sent: boolean; reason?: string }> {
  if (!CAN_NOTIFY_ADMIN) {
    console.info(
      `[email] stub — would notify LAAL of stockist enquiry ${enquiry.id}` +
        ` from ${enquiry.businessName} (${enquiry.businessType ?? "type not given"}, ${enquiry.city}).`,
    );
    return { sent: false, reason: "No email provider configured yet." };
  }

  return trySend({
    to: adminNotificationEmail as string,
    subject: `Stockist enquiry — ${enquiry.businessName}`,
    html: renderEmail(
      "New stockist enquiry",
      `<p><strong>${enquiry.businessName}</strong> (${enquiry.businessType ?? "type not given"})</p>
       <p>Contact: ${enquiry.contactName} · ${enquiry.whatsapp}${enquiry.email ? ` · ${enquiry.email}` : ""}</p>
       <p>City: ${enquiry.city}${enquiry.province ? `, ${enquiry.province}` : ""}</p>
       ${enquiry.expectedMonthlyVolume ? `<p>Expected monthly volume: ${enquiry.expectedMonthlyVolume}</p>` : ""}
       ${enquiry.message ? `<p>Message: ${enquiry.message}</p>` : ""}`,
    ),
  });
}

/**
 * General contact-form notification.
 *
 * Kept separate from the stockist notification on purpose — different audience, different
 * triage, and different templates.
 */
export async function sendContactMessageEmail(
  contact: ContactMessage,
): Promise<{ sent: boolean; reason?: string }> {
  if (!CAN_NOTIFY_ADMIN) {
    console.info(
      `[email] stub — would notify LAAL of contact message ${contact.id} from ${contact.email}.`,
    );
    return { sent: false, reason: "No email provider configured yet." };
  }

  return trySend({
    to: adminNotificationEmail as string,
    subject: `Contact message from ${contact.name}`,
    html: renderEmail(
      "New contact message",
      `<p><strong>${contact.name}</strong> · ${contact.email}</p>
       <p>${contact.message}</p>`,
    ),
  });
}

/**
 * Order status change notification to the customer.
 *
 * Called from the admin order screen whenever status changes. This is the fallback channel:
 * dispatch tracking is sent by a staff member tapping the WhatsApp button, which is a manual
 * step and can be skipped, so "we'll notify you by WhatsApp or email" still needs an email
 * path to be true.
 *
 * Only sends when order.customerEmail is present — email is optional at checkout. Only needs
 * RESEND_API_KEY + EMAIL_FROM, not ADMIN_NOTIFICATION_EMAIL — the recipient is the customer.
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

  if (!CAN_SEND) {
    console.info(
      `[email] stub — would tell ${order.customerEmail} that ${order.orderNumber} moved` +
        ` ${previousStatus} → ${order.status}` +
        (order.trackingNumber ? ` (tracking ${order.trackingNumber}).` : "."),
    );
    return { sent: false, reason: "No email provider configured yet." };
  }

  return trySend({
    to: order.customerEmail,
    subject: `Your ${SITE.name} order ${order.orderNumber} — ${order.status}`,
    html: renderEmail(
      `Order update — ${order.orderNumber}`,
      `<p>Status: <strong>${previousStatus}</strong> → <strong>${order.status}</strong></p>
       ${order.trackingNumber ? `<p>Tracking number: ${order.trackingNumber}</p>` : ""}`,
    ),
  });
}

/**
 * Admin password reset.
 *
 * The raw token only ever exists in this message and in the recipient's URL — the database
 * stores its hash. The token (and the full reset URL) is deliberately NOT logged, even on a
 * successful live send, so the dev console or a log aggregator cannot be used to take over an
 * account.
 *
 * Only needs RESEND_API_KEY + EMAIL_FROM — recipient is admin.email, which is always real DB
 * data, not an env var.
 */
export async function sendPasswordResetEmail(
  admin: AdminUser,
  resetUrl: string,
): Promise<{ sent: boolean; reason?: string }> {
  if (!CAN_SEND) {
    console.info(
      `[email] stub — would send a password reset link to ${admin.email} (link withheld from logs).`,
    );
    return { sent: false, reason: "No email provider configured yet." };
  }

  const result = await trySend({
    to: admin.email,
    subject: `${SITE.name} admin — password reset`,
    html: renderEmail(
      "Password reset requested",
      `<p>Hi ${admin.name}, use the link below to set a new password. This link expires soon and can only be used once.</p>
       <p><a href="${resetUrl}" style="color:#8C1C35;">Reset your password</a></p>
       <p style="color:#6B6B6B;font-size:12px;">If you didn't request this, you can ignore this email.</p>`,
    ),
  });

  // Log only that a send was attempted, never the URL or token, on success or failure.
  console.info(
    `[email] password reset link ${result.sent ? "sent" : "attempted"} to ${admin.email} (link withheld from logs).`,
  );

  return result;
}
