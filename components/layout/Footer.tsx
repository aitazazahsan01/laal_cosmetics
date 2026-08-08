import Link from "next/link";

import {
  CONTACT_EMAIL,
  FOOTER_NAV,
  INSTAGRAM_URL,
  SITE,
  WHATSAPP_CONFIGURED,
  WHATSAPP_URL,
} from "@/lib/config";
import { PendingNote } from "@/components/ui/PendingNote";

/**
 * Site footer — oxblood background.
 *
 * The vector lockup is oxblood-on-transparent and would be invisible here, and recolouring
 * it is forbidden by the brand guidance, so the footer uses the serif wordmark instead
 * (exactly as the approved Phase A mockups do).
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-oxblood text-blush">
      <div className="mx-auto grid max-w-shell grid-cols-1 gap-10 px-5 pb-8 pt-14 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <span className="font-serif text-[1.1rem] tracking-wordmark text-white">
            {SITE.name}
          </span>
          <p className="mt-[0.9rem] max-w-[30ch] text-[0.85rem] text-blush/70">
            {SITE.footerBlurb}
          </p>

          <p className="mt-6 max-w-[30ch] text-[0.85rem] text-blush/70">
            {SITE.address}
          </p>

          <div className="mt-6 text-[0.85rem]">
            {WHATSAPP_CONFIGURED ? (
              <a
                href={WHATSAPP_URL}
                className="text-blush/80 hover:text-white"
                rel="noopener noreferrer"
                target="_blank"
              >
                WhatsApp us
              </a>
            ) : (
              <div className="flex flex-col items-start gap-2">
                <span className="text-blush/80">WhatsApp</span>
                <PendingNote
                  label="Number pending — LAAL to supply"
                  tone="onDark"
                />
              </div>
            )}

            {CONTACT_EMAIL ? (
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="mt-2 block text-blush/80 hover:text-white"
              >
                {CONTACT_EMAIL}
              </a>
            ) : (
              <div className="mt-3 flex flex-col items-start gap-2">
                <span className="text-blush/80">Email</span>
                <PendingNote
                  label="Address pending — LAAL to supply"
                  tone="onDark"
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center gap-3">
            {INSTAGRAM_URL ? (
              <a
                href={INSTAGRAM_URL}
                className="text-blush/80 hover:text-white"
                rel="noopener noreferrer"
                target="_blank"
                aria-label="LAAL on Instagram"
              >
                <InstagramIcon />
              </a>
            ) : (
              <span
                className="text-blush/40"
                role="img"
                aria-label="Instagram — pending, LAAL to supply"
                title="Instagram — pending, LAAL to supply"
              >
                <InstagramIcon />
              </span>
            )}
          </div>
        </div>

        {FOOTER_NAV.map((column) => (
          <div key={column.heading}>
            <h4 className="mb-4 text-[0.72rem] uppercase tracking-[0.12em] text-blush">
              {column.heading}
            </h4>
            <ul className="grid gap-[0.65rem]">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[0.88rem] text-blush/80 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto flex max-w-shell flex-wrap justify-between gap-2 border-t border-blush/15 px-5 py-6 text-[0.75rem] text-blush/60">
        <span>
          © {year} {SITE.legalName}, {SITE.city}
        </span>
        <span>{SITE.domain}</span>
      </div>
    </footer>
  );
}

/** Instagram glyph, matching the WhatsApp icon's currentColor / viewBox convention. */
function InstagramIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4.6" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default Footer;
