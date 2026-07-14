import type { ReactNode } from "react";

/**
 * Accordion, built on native <details>/<summary>.
 *
 * Deliberately dependency-free and JS-free: it works before hydration, is keyboard
 * accessible for nothing extra, and degrades to plain visible text if CSS fails.
 *
 * RESERVED FOR FAQs. The SRS requires the full INCI list, patch-test copy and who-it's-for
 * content to stay always visible — those render as plain sections and must never be wrapped
 * in this component.
 */

export function Accordion({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`max-w-[680px] border-t border-line ${className}`}>
      {children}
    </div>
  );
}

export function AccordionItem({
  question,
  defaultOpen = false,
  children,
}: {
  question: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details className="group border-b border-line" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-[1.1rem] font-semibold text-oxblood [&::-webkit-details-marker]:hidden">
        <span>{question}</span>
        <span
          aria-hidden="true"
          className="flex-none font-bold text-ruby transition-transform group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="max-w-[56ch] pb-[1.2rem] text-[0.92rem] text-muted">
        {children}
      </div>
    </details>
  );
}

export default Accordion;
