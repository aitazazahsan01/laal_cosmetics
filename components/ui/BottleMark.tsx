export type BottleMarkVariant = "front" | "label" | "outline";

type BottleMarkProps = {
  variant?: BottleMarkVariant;
  /** Rendered height in px; width follows the 90:190 aspect ratio. */
  height?: number;
  /** Optional caption text drawn on the label panel (the "label" variant only). */
  captionText?: string;
  /** Accessible name. Omit to mark the mark decorative. */
  title?: string;
  className?: string;
};

const RATIO = 90 / 190;

/**
 * Line-art bottle placeholder.
 *
 * No product photography exists yet (P-01 is pending from LAAL) and the brand uses no stock
 * imagery, so this stands in. It is built only from palette colours, carries enough presence
 * that empty space does not read as unfinished, and is not meant to resemble the final
 * product shots. Every place it appears is accompanied by a <PendingNote>.
 */
export function BottleMark({
  variant = "front",
  height = 190,
  captionText,
  title,
  className = "",
}: BottleMarkProps) {
  const width = Math.round(height * RATIO);
  const decorative = !title;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 90 190"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}

      {variant === "front" ? (
        <>
          <rect x="30" y="8" width="30" height="20" rx="4" fill="#8C1C35" />
          <path
            d="M30 28 L60 28 L52 46 L38 46 Z"
            fill="none"
            stroke="#4A0A12"
            strokeWidth="2"
          />
          <rect
            x="14"
            y="46"
            width="62"
            height="136"
            rx="12"
            fill="#FFFFFF"
            stroke="#4A0A12"
            strokeWidth="2"
          />
          <rect
            x="14"
            y="94"
            width="62"
            height="42"
            fill="#FAF1F2"
            stroke="#4A0A12"
            strokeWidth="1.5"
          />
          <line x1="14" y1="94" x2="76" y2="94" stroke="#8C1C35" strokeWidth="2" />
          <line
            x1="14"
            y1="136"
            x2="76"
            y2="136"
            stroke="#8C1C35"
            strokeWidth="2"
          />
        </>
      ) : null}

      {variant === "label" ? (
        <>
          <rect x="30" y="8" width="30" height="20" rx="4" fill="#4A0A12" />
          <path
            d="M30 28 L60 28 L52 46 L38 46 Z"
            fill="none"
            stroke="#4A0A12"
            strokeWidth="2"
          />
          <rect
            x="14"
            y="46"
            width="62"
            height="136"
            rx="12"
            fill="#FFFFFF"
            stroke="#E7D6D8"
            strokeWidth="2"
          />
          <rect
            x="14"
            y="94"
            width="62"
            height="42"
            fill="#8C1C35"
            fillOpacity="0.08"
            stroke="#8C1C35"
            strokeWidth="1.5"
          />
          {captionText ? (
            <text
              x="45"
              y="118"
              textAnchor="middle"
              fontFamily="var(--font-heading)"
              fontSize="9"
              fill="#4A0A12"
            >
              {captionText}
            </text>
          ) : null}
        </>
      ) : null}

      {variant === "outline" ? (
        <>
          <rect
            x="30"
            y="8"
            width="30"
            height="20"
            rx="4"
            fill="#8C1C35"
            fillOpacity="0.5"
          />
          <path
            d="M30 28 L60 28 L52 46 L38 46 Z"
            fill="none"
            stroke="#E7D6D8"
            strokeWidth="2"
          />
          <rect
            x="14"
            y="46"
            width="62"
            height="136"
            rx="12"
            fill="none"
            stroke="#E7D6D8"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
        </>
      ) : null}
    </svg>
  );
}

export default BottleMark;
