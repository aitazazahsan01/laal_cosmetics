import Link from "next/link";
import type { ReactNode } from "react";

import {
  CONTACT_EMAIL,
  FACEBOOK_URL,
  FOOTER_NAV,
  INSTAGRAM_URL,
  LINKEDIN_URL,
  SITE,
  WHATSAPP_CONFIGURED,
  WHATSAPP_URL,
} from "@/lib/config";
import { NewsletterForm } from "@/components/layout/NewsletterForm";
import { PendingNote } from "@/components/ui/PendingNote";
import { CERTIFICATION_FACTS, TrustBadge } from "@/components/ui/TrustBadge";

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
            <SocialIcon href={INSTAGRAM_URL} label="Instagram" icon={<InstagramIcon />} />
            <SocialIcon href={FACEBOOK_URL} label="Facebook" icon={<FacebookIcon />} />
            <SocialIcon
              href={CONTACT_EMAIL ? `mailto:${CONTACT_EMAIL}` : null}
              label="Email"
              icon={<EmailIcon />}
            />
            <SocialIcon href={LINKEDIN_URL} label="LinkedIn" icon={<LinkedInIcon />} />
          </div>

          {/* Certification & testing chips — same three facts as the About page, kept in
              sync via the shared CERTIFICATION_FACTS list. No payment-network logos (LAAL
              takes no card payments) and no social icons beyond WhatsApp/Instagram above. */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {CERTIFICATION_FACTS.map((fact) => (
              <TrustBadge
                key={fact.heading}
                icon={fact.icon}
                heading={fact.shortLabel}
                tone="onDark"
                variant="chip"
              />
            ))}
          </div>

          <div className="mt-7">
            <h4 className="mb-3 text-[0.72rem] uppercase tracking-[0.12em] text-blush">
              Get updates
            </h4>
            <NewsletterForm />
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

/**
 * One social/contact icon link — active (real URL/address) or inert (pending, same visual
 * treatment as the WhatsApp/email "pending" fallbacks above: dimmed, non-interactive, but
 * still present so the layout doesn't shift once LAAL supplies the missing handle).
 */
function SocialIcon({
  href,
  label,
  icon,
}: {
  href: string | null;
  label: string;
  icon: ReactNode;
}) {
  if (!href) {
    return (
      <span
        className="text-blush/40"
        role="img"
        aria-label={`${label} — pending, LAAL to supply`}
        title={`${label} — pending, LAAL to supply`}
      >
        {icon}
      </span>
    );
  }

  const isMailto = href.startsWith("mailto:");

  return (
    <a
      href={href}
      className="text-blush/80 hover:text-white"
      rel={isMailto ? undefined : "noopener noreferrer"}
      target={isMailto ? undefined : "_blank"}
      aria-label={`LAAL on ${label}`}
    >
      {icon}
    </a>
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

/** Facebook glyph, same stroke/viewBox convention as the icons above. */
function FacebookIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

/** Envelope glyph, for the email contact link. */
function EmailIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
      <path d="M3.5 6l8.5 6.5L20.5 6" />
    </svg>
  );
}

/** LinkedIn glyph, same stroke/viewBox convention as the icons above. */
function LinkedInIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="4" />
      <line x1="7.2" y1="10" x2="7.2" y2="16.8" />
      <circle cx="7.2" cy="6.6" r="0.4" fill="currentColor" />
      <path d="M11.6 16.8v-4a2.4 2.4 0 0 1 4.8 0v4" />
      <line x1="11.6" y1="10" x2="11.6" y2="16.8" />
    </svg>
  );
}

export default Footer;
