import type { ReactNode } from "react";

/**
 * Trust badge — icon + short heading + optional supporting text, card- or chip-styled.
 *
 * Populated ONLY with facts LAAL has actually supplied. The three certification/testing facts
 * below (`CERTIFICATION_FACTS`) are the single source of truth for that content, shared by the
 * About page and the footer so the wording can never drift between the two. The home page hero
 * trust strip reuses the same visual component with its own, separately-approved copy (Content
 * Pack §4) — passed in directly by the caller rather than through `CERTIFICATION_FACTS`.
 *
 * Icons are either simple inline line-art SVGs (matching the stroke/currentColor convention
 * already used by the Instagram glyph in Footer.tsx) or a supplied raster image — but only
 * when that image is actually accurate. Every raster icon used here has been checked to say
 * the correct standard/fact with no unrelated third party's branding on it; a supplied image
 * that didn't meet that bar was deliberately left on the plain SVG instead rather than wired
 * in — see the `icon` value for ISO 22716:2007 in CERTIFICATION_FACTS below.
 */

export type TrustBadgeIcon = "shieldCheck" | "ribbon" | "flask" | "document" | "ban";

/** A supplied image, used in place of a line-art icon once it's been verified accurate. */
export type TrustBadgeIconRef = TrustBadgeIcon | { image: string; alt: string };

type Tone = "ruby" | "onDark";
type Variant = "card" | "chip";

type TrustBadgeProps = {
  icon: TrustBadgeIconRef;
  heading: string;
  /** Supporting sentence. Card variant only — chips show the icon and heading alone. */
  body?: string;
  /**
   * "ruby" — the default, for white/blush pages.
   * "onDark" — for the oxblood footer, where ruby text has too little contrast (same rule as
   * <PendingNote>'s `tone` prop).
   */
  tone?: Tone;
  /** "card" — full bordered card for About/Home. "chip" — compact pill for the footer. */
  variant?: Variant;
  className?: string;
};

const ICONS: Record<TrustBadgeIcon, (size: number) => ReactNode> = {
  shieldCheck: (size) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3l7 3v5c0 5-3.2 8.6-7 10-3.8-1.4-7-5-7-10V6l7-3z" />
      <path d="M8.7 12.2l2.2 2.2 4.3-4.6" />
    </svg>
  ),
  ribbon: (size) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8.5" r="5.5" />
      <path d="M8.7 13.2L7 21l5-2.7 5 2.7-1.7-7.8" />
    </svg>
  ),
  flask: (size) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9.5 2.5h5" />
      <path d="M10.3 2.5v6.7l-5 9.3a1.8 1.8 0 0 0 1.6 2.6h10.2a1.8 1.8 0 0 0 1.6-2.6l-5-9.3V2.5" />
      <path d="M7.3 16h9.4" />
    </svg>
  ),
  document: (size) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6.5 2.5h8l4 4v14.5a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-17.5a1 1 0 0 1 1-1z" />
      <path d="M14 2.5v4.5h4.5" />
      <path d="M8.3 12h7.4M8.3 15.2h7.4M8.3 18.4h4.5" />
    </svg>
  ),
  ban: (size) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M5.8 5.8l12.4 12.4" />
    </svg>
  ),
};

const toneClasses: Record<Tone, { icon: string; heading: string; body: string; border: string }> = {
  ruby: { icon: "text-ruby", heading: "text-oxblood", body: "text-muted", border: "border-line" },
  onDark: {
    icon: "text-blush",
    heading: "text-blush",
    body: "text-blush/70",
    border: "border-blush/25",
  },
};

/** Renders either a line-art SVG (by name) or a supplied image, at the given box size. */
function renderIcon(icon: TrustBadgeIconRef, size: number, iconClassName: string): ReactNode {
  if (typeof icon === "string") {
    return <span className={iconClassName}>{ICONS[icon](size)}</span>;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={icon.image}
      alt={icon.alt}
      style={{ width: size, height: size }}
      className="flex-none rounded-full object-contain"
    />
  );
}

export function TrustBadge({
  icon,
  heading,
  body,
  tone = "ruby",
  variant = "card",
  className = "",
}: TrustBadgeProps) {
  const colors = toneClasses[tone];

  if (variant === "chip") {
    return (
      <div
        className={`flex items-center gap-2 rounded-full border px-3 py-[0.35rem] text-[0.72rem] font-medium ${colors.border} ${colors.heading} ${className}`}
      >
        {renderIcon(icon, 15, colors.icon)}
        <span>{heading}</span>
      </div>
    );
  }

  return (
    <div className={`rounded-card border p-6 ${colors.border} ${className}`}>
      {renderIcon(icon, 26, colors.icon)}
      <h3 className={`mt-3 text-[0.96rem] font-bold ${colors.heading}`}>{heading}</h3>
      {body ? <p className={`mt-2 text-[0.85rem] leading-[1.55] ${colors.body}`}>{body}</p> : null}
    </div>
  );
}

/**
 * The only three certification/testing facts LAAL has supplied. No fourth fact, and no Halal
 * claim — LAAL has never mentioned Halal certification in any supplied material.
 *
 * `shortLabel` is for the footer's compact chip row; `heading`/`body` are for the full card
 * used on About and Home.
 *
 * ISO 22716:2007 stays on the plain "shieldCheck" SVG rather than a supplied image
 * (public/brand/iso2007.jpg): that file is actually an "ISO 22000 CERTIFIED" badge — food-safety
 * management, a different standard — carrying an unrelated third-party company's watermark.
 * Wiring it in would put a false certification claim and someone else's logo on the live site,
 * so it was deliberately left out. Swap it in the moment there's an accurate one.
 */
export const CERTIFICATION_FACTS: {
  icon: TrustBadgeIconRef;
  shortLabel: string;
  heading: string;
  body: string;
}[] = [
  {
    icon: "shieldCheck",
    shortLabel: "ISO 22716:2007",
    heading: "ISO 22716:2007 Certified",
    body: "Cosmetics Good Manufacturing Practice. LAAL's serums are made in an ISO 22716:2007 certified facility.",
  },
  {
    icon: { image: "/brand/iso2015.jpg", alt: "ISO 9001:2015 Certified" },
    shortLabel: "ISO 9001:2015",
    heading: "ISO 9001:2015 Certified",
    body: "Quality Management. The same facility holds ISO 9001:2015 certification.",
  },
  {
    icon: { image: "/brand/flask.jpg", alt: "Independently tested" },
    shortLabel: "Independently tested",
    heading: "Independently Tested",
    body: "Both formulations were submitted to PCSIR Laboratories Islamabad — a Government of Pakistan laboratory — before a single bottle was sold. Mercury: not detectable. Patch test: negative.",
  },
];

export default TrustBadge;
