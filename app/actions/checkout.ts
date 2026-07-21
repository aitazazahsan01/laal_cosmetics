"use server";

import { redirect } from "next/navigation";

import { clearCart, readCart } from "@/lib/cart";
import type { CheckoutState } from "@/lib/checkout-state";
import { createOrder } from "@/lib/orders";
import { savePaymentScreenshot } from "@/lib/uploads";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/types";

/**
 * Checkout submission.
 *
 * Guest only — there is no account creation anywhere in this flow, not even as a skippable
 * step, per the SRS.
 *
 * This action deliberately does NOT read any money value from the form. It forwards the
 * customer's details plus the cart's slugs and quantities to createOrder(), which recomputes
 * every figure from the database. The totals the browser rendered are a preview.
 */

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function placeOrderAction(
  _prevState: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const fieldErrors: Record<string, string> = {};

  const customerName = text(formData, "customerName");
  const customerWhatsapp = text(formData, "customerWhatsapp");
  const customerEmail = text(formData, "customerEmail");
  const addressLine1 = text(formData, "addressLine1");
  const city = text(formData, "city");
  const province = text(formData, "province");
  const notes = text(formData, "notes");
  const paymentMethodRaw = text(formData, "paymentMethod");

  if (customerName.length < 2) {
    fieldErrors.customerName = "Enter your full name.";
  }

  // Pakistani mobile numbers, permissively: digits, spaces, dashes, optional +92.
  const digits = customerWhatsapp.replace(/[^\d]/g, "");
  if (digits.length < 10 || digits.length > 15) {
    fieldErrors.customerWhatsapp = "Enter a valid WhatsApp number.";
  }

  if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    fieldErrors.customerEmail = "That email address doesn't look right.";
  }

  if (addressLine1.length < 6) {
    fieldErrors.addressLine1 = "Enter your full delivery address.";
  }
  if (city.length < 2) {
    fieldErrors.city = "Enter your city.";
  }
  if (!province) {
    fieldErrors.province = "Select your province.";
  }

  const paymentMethod = PAYMENT_METHODS.includes(paymentMethodRaw as PaymentMethod)
    ? (paymentMethodRaw as PaymentMethod)
    : null;
  if (!paymentMethod) {
    fieldErrors.paymentMethod = "Choose a payment method.";
  }

  const cart = await readCart();
  if (cart.items.length === 0) {
    return { error: "Your cart is empty.", fieldErrors: {} };
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { error: "Please check the highlighted fields.", fieldErrors };
  }

  // Payment proof, for the three non-COD methods.
  let paymentScreenshotUrl: string | null = null;
  const upload = formData.get("paymentScreenshot");
  if (paymentMethod !== "COD" && upload instanceof File && upload.size > 0) {
    const saved = await savePaymentScreenshot(upload);
    if (!saved.ok) {
      return {
        error: null,
        fieldErrors: { paymentScreenshot: saved.reason },
      };
    }
    paymentScreenshotUrl = saved.url;
  }

  const result = await createOrder({
    items: cart.items.map((item) => ({ slug: item.slug, quantity: item.qty })),
    discountCode: cart.discountCode,
    customerName,
    customerWhatsapp,
    customerEmail: customerEmail || null,
    addressLine1,
    city,
    province,
    notes: notes || null,
    paymentMethod: paymentMethod!,
    paymentScreenshotUrl,
  });

  if (!result.ok) {
    return { error: result.error, fieldErrors: {} };
  }

  await clearCart();
  await grantOrderAccess(result.orderNumber);

  // redirect() throws internally, so it must sit outside any try/catch above.
  redirect(`/order/${result.orderNumber}`);
}

/**
 * Marks this browser as the one that placed the order.
 *
 * Order numbers are sequential and therefore guessable, so the confirmation page shows the
 * customer's name, address and phone number only to the browser that checked out. Anyone
 * else opening the URL sees just the order number and status. A signed token on the Order row
 * would be the stronger fix and belongs with the admin work in a later phase.
 */
async function grantOrderAccess(orderNumber: string): Promise<void> {
  const { cookies } = await import("next/headers");
  const store = await cookies();

  const existing = store.get("laal_orders")?.value ?? "";
  const numbers = existing.split(",").filter(Boolean);
  if (!numbers.includes(orderNumber)) numbers.push(orderNumber);

  store.set("laal_orders", numbers.slice(-20).join(","), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
}
