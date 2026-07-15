import type { ReactNode } from "react";

/**
 * The label / heading / lede block every content page opens with.
 *
 * Shared so the vertical rhythm and type scale stay identical across About, Ingredients,
 * Stockists, Contact and the four policy pages.
 */
export function PageHeader({
  label,
  heading,
  lede,
  children,
}: {
  label: string;
  heading: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="pb-8 pt-14">
      <span className="label">{label}</span>
      <h1 className="mt-3 max-w-[20ch] font-serif text-[clamp(2rem,4vw,2.7rem)]">
        {heading}
      </h1>
      {lede ? (
        <div className="mt-4 max-w-[58ch] text-[1.02rem]">{lede}</div>
      ) : null}
      {children}
    </div>
  );
}

export default PageHeader;
