import { PENDING_LABEL } from "@/lib/config";

type Variant = "badge" | "block";
type Tone = "ruby" | "onDark";

type PendingNoteProps = {
  /** What is pending. Defaults to the shared wording in lib/config.ts. */
  label?: string;
  /**
   * "badge" — a small inline pill, for prices and short gaps.
   * "block" — a dashed panel that occupies a whole slot, for empty content sections.
   */
  variant?: Variant;
  /**
   * "ruby" — the default, for the white/blush pages.
   * "onDark" — for the oxblood footer, where ruby has too little contrast.
   *
   * Tone is a prop rather than a className override on purpose: two competing Tailwind
   * colour utilities in one class list resolve by stylesheet order, not by the order they
   * are written, so overriding from outside would be unreliable.
   */
  tone?: Tone;
  className?: string;
};

const badgeTone: Record<Tone, string> = {
  ruby: "border-ruby bg-ruby/[0.07] text-ruby",
  onDark: "border-blush/60 text-blush/90",
};

const blockTone: Record<Tone, string> = {
  ruby: "border-ruby/60 bg-ruby/[0.04] text-ruby",
  onDark: "border-blush/50 text-blush/90",
};

/**
 * The single, consistent treatment for content LAAL has not supplied yet.
 *
 * The SRS forbids writing product claims independently, so every gap in the catalogue is
 * shown honestly rather than filled with invented copy. Use this component everywhere such a
 * gap appears — never write a bespoke "coming soon" string.
 */
export function PendingNote({
  label = PENDING_LABEL,
  variant = "badge",
  tone = "ruby",
  className = "",
}: PendingNoteProps) {
  if (variant === "block") {
    return (
      <div
        className={`rounded-card border border-dashed px-5 py-4 ${blockTone[tone]} ${className}`}
      >
        <span className="text-[0.72rem] font-bold uppercase tracking-label">
          {label}
        </span>
      </div>
    );
  }

  return (
    <span
      className={`inline-block rounded-full border border-dashed px-[0.55rem] py-[0.2rem] text-[0.68rem] font-medium uppercase tracking-[0.06em] ${badgeTone[tone]} ${className}`}
    >
      {label}
    </span>
  );
}

export default PendingNote;
