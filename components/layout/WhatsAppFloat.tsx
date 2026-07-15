import { WHATSAPP_CONFIGURED, WHATSAPP_URL } from "@/lib/config";

/**
 * Floating WhatsApp button, fixed bottom-right.
 *
 * The real number has not been supplied yet — see WHATSAPP_NUMBER in lib/config.ts, which is
 * a clearly marked TODO placeholder. Until it is set the button is rendered but inert, so no
 * one is sent to an unrelated real number.
 */
export function WhatsAppFloat() {
  const label = WHATSAPP_CONFIGURED
    ? "Chat with LAAL on WhatsApp"
    : "WhatsApp number pending — LAAL to supply";

  const className =
    "fixed bottom-5 right-5 z-50 flex h-[3.4rem] w-[3.4rem] items-center justify-center rounded-full bg-ruby text-white shadow-float transition-colors hover:bg-oxblood";

  const icon = (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 20 12a8 8 0 0 1-8 8zm4.4-5.9c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.7-.3-1.4-.7-2-1.3-.5-.5-1-1.1-1.4-1.8-.1-.2 0-.4.1-.5l.4-.4c.1-.1.1-.3.2-.4.1-.1 0-.3 0-.4-.1-.1-.5-1.3-.7-1.8-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.7.7-.9 1.6-.8 2.5.2 1.2.9 2.4 1.9 3.5 1.3 1.5 2.7 2.4 4.5 2.9.5.1 1 .2 1.6.1.6-.1 1.4-.7 1.6-1.3.2-.6.2-1.1.1-1.3-.1-.1-.2-.2-.4-.3z" />
    </svg>
  );

  if (!WHATSAPP_CONFIGURED) {
    return (
      <span className={className} role="img" aria-label={label} title={label}>
        {icon}
      </span>
    );
  }

  return (
    <a
      href={WHATSAPP_URL}
      className={className}
      aria-label={label}
      rel="noopener noreferrer"
      target="_blank"
    >
      {icon}
    </a>
  );
}

export default WhatsAppFloat;
