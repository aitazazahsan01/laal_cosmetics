import type { ReactNode } from "react";

/**
 * Shared admin building blocks.
 *
 * The admin panel uses the same brand tokens as the storefront but a denser, plainer layout —
 * it is a working tool for two people, not a shop window.
 */

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
      <div>
        <h1 className="font-serif text-[1.6rem] text-oxblood">{title}</h1>
        {description ? (
          <p className="mt-1 text-[0.9rem] text-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex gap-3">{actions}</div> : null}
    </div>
  );
}

export function Panel({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-card border border-line bg-white p-6 ${className}`}
    >
      {title ? (
        <h2 className="mb-4 font-serif text-[1.1rem] text-oxblood">{title}</h2>
      ) : null}
      {children}
    </section>
  );
}

export function Notice({
  tone = "success",
  children,
}: {
  tone?: "success" | "error";
  children: ReactNode;
}) {
  const styles =
    tone === "error"
      ? "border-ruby bg-ruby/[0.06] text-ruby"
      : "border-oxblood/30 bg-blush text-oxblood";

  return (
    <div
      role="status"
      className={`mb-6 rounded-card border px-4 py-3 text-[0.88rem] ${styles}`}
    >
      {children}
    </div>
  );
}

const STATUS_TONES: Record<string, string> = {
  PENDING_PAYMENT: "border-muted/40 bg-white text-muted",
  CONFIRMED: "border-ruby/40 bg-ruby/[0.07] text-ruby",
  PACKED: "border-ruby/40 bg-ruby/[0.07] text-ruby",
  DISPATCHED: "border-oxblood/40 bg-blush text-oxblood",
  DELIVERED: "border-oxblood bg-oxblood text-white",
  CANCELLED: "border-muted/40 bg-white text-muted line-through",
  NEW: "border-ruby/40 bg-ruby/[0.07] text-ruby",
  CONTACTED: "border-oxblood/40 bg-blush text-oxblood",
  APPROVED: "border-oxblood bg-oxblood text-white",
  DECLINED: "border-muted/40 bg-white text-muted",
  READ: "border-oxblood/40 bg-blush text-oxblood",
  REPLIED: "border-oxblood bg-oxblood text-white",
};

export function StatusBadge({
  status,
  label,
}: {
  status: string;
  label: string;
}) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full border px-[0.6rem] py-[0.15rem] text-[0.68rem] font-bold uppercase tracking-[0.06em] ${
        STATUS_TONES[status] ?? "border-line bg-white text-ink"
      }`}
    >
      {label}
    </span>
  );
}

/** Compact label + input, the admin equivalent of the storefront FormField. */
export function AdminField({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  hint,
  step,
  min,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number | null;
  placeholder?: string;
  hint?: string;
  step?: string;
  min?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="mb-[0.35rem] block text-[0.72rem] uppercase tracking-[0.08em] text-muted"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        step={step}
        min={min}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="w-full rounded border border-line bg-white px-3 py-2 text-[0.92rem] text-ink focus:border-ruby focus:outline-none"
      />
      {hint ? (
        <p className="mt-1 text-[0.75rem] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function AdminSubmit({
  children = "Save",
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={`rounded-btn bg-ruby px-6 py-[0.7rem] text-[0.74rem] font-bold uppercase tracking-button text-white hover:bg-oxblood ${className}`}
    >
      {children}
    </button>
  );
}
