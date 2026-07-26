"use server";

import { sendContactMessageEmail } from "@/lib/email";
import type { FormState } from "@/lib/form-state";
import { prisma } from "@/lib/prisma";

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
