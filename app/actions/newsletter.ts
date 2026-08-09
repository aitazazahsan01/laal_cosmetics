"use server";

import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

/**
 * Footer newsletter signup.
 *
 * Same honeypot + rate-limit shape as the contact/stockist forms (see app/actions/contact.ts).
 * A repeat signup from the same email is upserted rather than treated as an error — success
 * either way avoids revealing whether an address was already on the list.
 */

export type NewsletterFormState = {
  status: "idle" | "error" | "success";
  message: string | null;
};

export const initialNewsletterState: NewsletterFormState = {
  status: "idle",
  message: null,
};

export async function subscribeToNewsletterAction(
  _prevState: NewsletterFormState,
  formData: FormData,
): Promise<NewsletterFormState> {
  // Honeypot: same convention as the contact/stockist forms — a hidden field a real visitor
  // never fills. Pretend success without persisting anything.
  if (String(formData.get("company_website") ?? "").trim()) {
    return { status: "success", message: "You're on the list." };
  }

  const ip = await getClientIp();
  const { allowed } = await checkRateLimit(`newsletter:ip:${ip}`, {
    max: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!allowed) {
    return {
      status: "error",
      message: "Too many attempts from this connection — please try again later.",
    };
  }

  const email = String(formData.get("email") ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Enter a valid email address." };
  }

  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: {},
      create: { email },
    });
    return { status: "success", message: "You're on the list." };
  } catch (error) {
    console.error("[newsletter] could not save subscriber:", error);
    return {
      status: "error",
      message: "Something went wrong. Please try again.",
    };
  }
}
