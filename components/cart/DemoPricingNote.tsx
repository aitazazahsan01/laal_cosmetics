import { DEMO_PRICING_NOTE } from "@/lib/config";

/**
 * Shown wherever a total appears while LAAL's real prices are outstanding.
 *
 * This is distinct from <PendingNote>: a PendingNote marks content that is *absent*, whereas
 * this marks numbers that are *present but provisional*. Both are honest about the gap; they
 * just describe different situations, so they read differently on purpose.
 */
export function DemoPricingNote({ className = "" }: { className?: string }) {
  return (
    <p
      className={`rounded-card border border-dashed border-ruby/60 bg-ruby/[0.04] px-4 py-3 text-[0.78rem] leading-snug text-ruby ${className}`}
      role="note"
    >
      {DEMO_PRICING_NOTE}
    </p>
  );
}

export default DemoPricingNote;
