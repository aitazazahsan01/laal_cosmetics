"use server";

import { sendContactMessageEmail } from "@/lib/email";
import type { FormState } from "@/lib/form-state";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

/**
 * General contact submission.
 *
 * Deliberately its own action, its own table (ContactMessage) and its own notification —
 * not the stockist flow with different labels. A general enquiry has three fields, no
 * business context and different triage; conflating the two would make the stockist funnel
 * harder to work later and would bury real leads among general questions.
 */

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function submitContactMessageAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  // Honeypot: a hidden field a real visitor never sees or fills. A bot that fills every field
  // programmatically trips it. Pretend success without persisting anything or notifying
  // anyone — never reveal to the submitter that it was caught.
  if (text(formData, "company_website")) {
    return { status: "success", message: text(formData, "name") || "there", fieldErrors: {} };
  }

  const ip = await getClientIp();
  const { allowed } = await checkRateLimit(`contact:ip:${ip}`, {
    max: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!allowed) {
    return {
      status: "error",
      message:
        "Too many submissions from this connection — please try again in a while.",
      fieldErrors: {},
    };
  }

  const fieldErrors: Record<string, string> = {};

  const name = text(formData, "name");
  const email = text(formData, "email");
  const message = text(formData, "message");

  if (name.length < 2) {
    fieldErrors.name = "Enter your name.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = "Enter a valid email address.";
  }
  if (message.length < 10) {
    fieldErrors.message = "Please write a little more so we can help.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors,
    };
  }

  try {
    const contact = await prisma.contactMessage.create({
      data: { name, email, message, status: "NEW" },
    });

    try {
      await sendContactMessageEmail(contact);
    } catch (error) {
      console.error("[contact] notification failed (message is saved):", error);
    }

    return { status: "success", message: contact.name, fieldErrors: {} };
  } catch (error) {
    console.error("[contact] could not save message:", error);
    return {
      status: "error",
      message: "Something went wrong sending your message. Please try again.",
      fieldErrors: {},
    };
  }
}
