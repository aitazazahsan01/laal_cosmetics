/**
 * Continuously-scrolling announcement strip — pure CSS animation (see .marquee-track in
 * app/globals.css), pauses on hover/focus, and stops entirely under prefers-reduced-motion.
 *
 * `items` must be real, already-stated facts (see the caller) — this is a second, decorative
 * presentation of content that already exists as accessible static text elsewhere on the page,
 * never a new claim written just for the strip. Because of that, the whole strip is
 * `aria-hidden` — screen-reader users get the same information from the static trust sections
 * without having to parse an infinitely-repeating ticker.
 */
export function MarqueeStrip({
  items,
  className = "",
}: {
  items: string[];
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`marquee-viewport overflow-hidden border-y border-blush/15 bg-oxblood py-[0.7rem] ${className}`}
    >
      <div className="marquee-track flex w-max items-center">
        {[...items, ...items].map((item, index) => (
          <span
            key={index}
            className="flex items-center gap-3 whitespace-nowrap px-6 text-[0.76rem] font-semibold uppercase tracking-nav text-blush"
          >
            {item}
            <span className="text-ruby">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default MarqueeStrip;
