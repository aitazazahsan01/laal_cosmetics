"use server";

import { sendStockistEnquiryEmail } from "@/lib/email";
import { BUSINESS_TYPES, type FormState } from "@/lib/form-state";
import { prisma } from "@/lib/prisma";

/**
 * Stockist / wholesale enquiry submission.
 *
 * Persists a StockistEnquiry with status "NEW", then calls the email notification stub —
 * exactly the pattern order creation uses, so the integration point is correct even though
 * nothing is actually sent yet.
 *
 * NO PRICING is accepted, computed, stored or returned anywhere in this flow. The SRS is
 * explicit that wholesale pricing is never shown publicly, and that extends to anything this
 * action could echo back onto a public page.
 */

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function submitStockistEnquiryAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const fieldErrors: Record<string, string> = {};

  const businessName = text(formData, "businessName");
  const businessType = text(formData, "businessType");
  const contactName = text(formData, "contactName");
  const whatsapp = text(formData, "whatsapp");
  const city = text(formData, "city");
  const expectedMonthlyVolume = text(formData, "expectedMonthlyVolume");
  const message = text(formData, "message");

  if (businessName.length < 2) {
    fieldErrors.businessName = "Enter your business name.";
  }
  if (!BUSINESS_TYPES.some((type) => type.value === businessType)) {
    fieldErrors.businessType = "Select a business type.";
  }
  if (contactName.length < 2) {
    fieldErrors.contactName = "Enter a contact person.";
  }

  const digits = whatsapp.replace(/[^\d]/g, "");
  if (digits.length < 10 || digits.length > 15) {
    fieldErrors.whatsapp = "Enter a valid WhatsApp number.";
  }
  if (city.length < 2) {
    fieldErrors.city = "Enter your city.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors,
    };
  }

  try {
    const enquiry = await prisma.stockistEnquiry.create({
      data: {
        businessName,
        businessType,
        contactName,
        whatsapp,
        city,
        expectedMonthlyVolume: expectedMonthlyVolume || null,
        message: message || null,
        status: "NEW",
      },
    });

    // Fire-and-forget: a notification failure must not lose an enquiry that is already saved.
    try {
      await sendStockistEnquiryEmail(enquiry);
    } catch (error) {
      console.error("[stockists] notification failed (enquiry is saved):", error);
    }

    return {
      status: "success",
      message: enquiry.businessName,
      fieldErrors: {},
    };
  } catch (error) {
    console.error("[stockists] could not save enquiry:", error);
    return {
      status: "error",
      message: "Something went wrong sending your enquiry. Please try again.",
      fieldErrors: {},
    };
  }
}
