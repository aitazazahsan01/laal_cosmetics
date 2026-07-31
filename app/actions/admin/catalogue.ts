"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DISCOUNT_TYPES, type DiscountType } from "@/lib/types";
import { saveProductImage } from "@/lib/uploads";

/**
 * Catalogue and shop configuration: products, discount codes and delivery settings.
 *
 * All three feed logic that already exists on the storefront — Product.priceRs drives the
 * pending-price badges, DiscountCode drives validateDiscountCode() at checkout, and
 * DeliverySettings drives computeTotals(). Nothing here needs a redeploy to take effect;
 * the storefront pages are force-dynamic and read these tables per request.
 */

/** Parses an optional whole-rupee amount. Empty string means "not supplied" → null. */
function optionalInt(formData: FormData, key: string): number | null {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) return null;
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

/* ------------------------------------------------------------------ *
 * Products
 * ------------------------------------------------------------------ */

export async function updateProductAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) redirect("/admin/products");

  const existing = await prisma.product.findUnique({ where: { slug } });
  if (!existing) redirect("/admin/products?error=notfound");

  const stockRaw = String(formData.get("stockQty") ?? "").trim();
  const parsedStock = Number.parseInt(stockRaw, 10);
  const stockQty =
    Number.isFinite(parsedStock) && parsedStock >= 0
      ? parsedStock
      : existing.stockQty;

  const shortDescription = String(formData.get("shortDescription") ?? "").trim();

  // Optional image upload, appended to whatever the product already has.
  let imageUrls: string[] = [];
  try {
    imageUrls = existing.imageUrls ? JSON.parse(existing.imageUrls) : [];
    if (!Array.isArray(imageUrls)) imageUrls = [];
  } catch {
    imageUrls = [];
  }

  const removeUrl = String(formData.get("removeImageUrl") ?? "").trim();
  if (removeUrl) {
    imageUrls = imageUrls.filter((url) => url !== removeUrl);
  }

  const upload = formData.get("image");
  if (upload instanceof File && upload.size > 0) {
    const saved = await saveProductImage(upload);
    if (saved.ok) {
      imageUrls.push(saved.url);
    } else {
      redirect(
        `/admin/products?error=${encodeURIComponent(saved.reason)}#${slug}`,
      );
    }
  }

  await prisma.product.update({
    where: { slug },
    data: {
      // priceRs stays nullable on purpose: clearing the field puts the storefront back into
      // its honest "price pending" state rather than forcing a number.
      priceRs: optionalInt(formData, "priceRs"),
      stockQty,
      shortDescription: shortDescription || null,
      imageUrls: imageUrls.length > 0 ? JSON.stringify(imageUrls) : null,
    },
  });

  // The storefront reads these per request, but revalidating keeps any cached shell honest.
  revalidatePath("/", "layout");

  redirect(`/admin/products?saved=${encodeURIComponent(slug)}`);
}

/* ------------------------------------------------------------------ *
 * Discount codes
 * ------------------------------------------------------------------ */

export async function saveDiscountAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const code = String(formData.get("code") ?? "")
    .trim()
    .toUpperCase();
  const typeRaw = String(formData.get("type") ?? "").trim();
  const valueRaw = String(formData.get("value") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const endsAtRaw = String(formData.get("endsAt") ?? "").trim();
  const isActive = formData.get("isActive") === "on";

  const type = DISCOUNT_TYPES.includes(typeRaw as DiscountType)
    ? (typeRaw as DiscountType)
    : null;
  const value = Number.parseInt(valueRaw, 10);

  const fail = (message: string) =>
    redirect(`/admin/discounts?error=${encodeURIComponent(message)}`);

  if (!code || !/^[A-Z0-9_-]{3,32}$/.test(code)) {
    fail("Code must be 3–32 characters: letters, numbers, hyphen or underscore.");
  }
  if (!type) fail("Choose a discount type.");
  if (!Number.isFinite(value) || value <= 0) fail("Enter a value above zero.");
  if (type === "PERCENT" && value > 100) fail("A percentage cannot exceed 100.");

  const data = {
    code,
    description: description || null,
    type: type as DiscountType,
    value,
    minSubtotalRs: optionalInt(formData, "minSubtotalRs"),
    maxRedemptions: optionalInt(formData, "maxRedemptions"),
    endsAt: endsAtRaw ? new Date(endsAtRaw) : null,
    isActive,
  };

  try {
    if (id) {
      await prisma.discountCode.update({ where: { id }, data });
    } else {
      await prisma.discountCode.create({ data });
    }
  } catch (error) {
    console.error("[admin] could not save discount:", error);
    fail("That code already exists.");
  }

  revalidatePath("/admin/discounts");
  redirect(`/admin/discounts?saved=${encodeURIComponent(code)}`);
}

export async function toggleDiscountAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/discounts");

  const existing = await prisma.discountCode.findUnique({ where: { id } });
  if (!existing) redirect("/admin/discounts?error=notfound");

  await prisma.discountCode.update({
    where: { id },
    data: { isActive: !existing.isActive },
  });

  revalidatePath("/admin/discounts");
  redirect("/admin/discounts?saved=1");
}

/* ------------------------------------------------------------------ *
 * Delivery settings
 * ------------------------------------------------------------------ */

export async function updateDeliverySettingsAction(
  formData: FormData,
): Promise<void> {
  await requireAdmin();

  const announcementBanner = String(
    formData.get("announcementBanner") ?? "",
  ).trim();

  await prisma.deliverySettings.upsert({
    where: { id: "default" },
    create: { id: "default" },
    update: {},
  });

  await prisma.deliverySettings.update({
    where: { id: "default" },
    data: {
      // Blank means "LAAL has not set this yet" and puts the storefront back into its
      // provisional-pricing state — that is a valid choice, not an error.
      standardFeeRs: optionalInt(formData, "standardFeeRs"),
      freeDeliveryThresholdRs: optionalInt(formData, "freeDeliveryThresholdRs"),
      codSurchargeRs: optionalInt(formData, "codSurchargeRs"),
      estimatedDaysMin: optionalInt(formData, "estimatedDaysMin"),
      estimatedDaysMax: optionalInt(formData, "estimatedDaysMax"),
      codAvailable: formData.get("codAvailable") === "on",
      announcementBanner: announcementBanner || null,
    },
  });

  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=1");
}

/* ------------------------------------------------------------------ *
 * Enquiries
 * ------------------------------------------------------------------ */

export async function updateStockistStatusAction(
  formData: FormData,
): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const internalNotes = String(formData.get("internalNotes") ?? "").trim();

  const allowed = ["NEW", "CONTACTED", "APPROVED", "DECLINED"];
  if (!id || !allowed.includes(status)) redirect("/admin/stockists");

  await prisma.stockistEnquiry.update({
    where: { id },
    data: { status, internalNotes: internalNotes || null },
  });

  revalidatePath("/admin/stockists");
  redirect("/admin/stockists?saved=1");
}

export async function updateContactStatusAction(
  formData: FormData,
): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  const allowed = ["NEW", "READ", "REPLIED"];
  if (!id || !allowed.includes(status)) redirect("/admin/contact");

  await prisma.contactMessage.update({ where: { id }, data: { status } });

  revalidatePath("/admin/contact");
  redirect("/admin/contact?saved=1");
}
