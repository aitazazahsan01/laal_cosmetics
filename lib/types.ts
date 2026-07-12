/**
 * Enum-shaped values.
 *
 * Prisma does not support `enum` blocks on SQLite, so these columns are Strings in
 * prisma/schema.prisma. These unions are the single source of truth for application code
 * and are kept in sync with the doc comments in the schema. When the datasource moves to
 * Postgres these can be promoted to real Prisma enums without touching call sites.
 */

export const PAYMENT_METHODS = [
  "COD",
  "EASYPAISA",
  "JAZZCASH",
  "BANK_TRANSFER",
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  COD: "Cash on Delivery",
  EASYPAISA: "Easypaisa",
  JAZZCASH: "JazzCash",
  BANK_TRANSFER: "Bank transfer",
};

export const ORDER_STATUSES = [
  "PENDING_PAYMENT",
  "CONFIRMED",
  "PACKED",
  "DISPATCHED",
  "DELIVERED",
  "CANCELLED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Pending payment",
  CONFIRMED: "Confirmed",
  PACKED: "Packed",
  DISPATCHED: "Dispatched",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const DISCOUNT_TYPES = ["PERCENT", "FIXED"] as const;
export type DiscountType = (typeof DISCOUNT_TYPES)[number];

export const STOCKIST_ENQUIRY_STATUSES = [
  "NEW",
  "CONTACTED",
  "APPROVED",
  "DECLINED",
] as const;
export type StockistEnquiryStatus = (typeof STOCKIST_ENQUIRY_STATUSES)[number];

export const ADMIN_ROLES = ["OWNER", "ADMIN", "STAFF"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

/** Derived from Product.stockQty — never stored on the row. */
export type StockStatus = "IN_STOCK" | "SOLD_OUT";

/** Shapes of the JSON-encoded Product columns. */
export type TimelineEntry = { label: string; text: string };
export type FaqEntry = { question: string; answer: string | null };
