import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 font-sans text-[0.78rem] font-bold uppercase tracking-button rounded-btn border border-transparent transition-colors";

const sizing = "px-7 py-[0.9rem]";

const variants: Record<ButtonVariant, string> = {
  // One filled style, reserved for the primary commerce action on a screen.
  primary: `${sizing} bg-ruby text-white hover:bg-oxblood`,
  secondary: `${sizing} bg-transparent text-oxblood border-oxblood hover:bg-blush`,
  // Ghost is a text link, not a box — lower letter-spacing, sentence case.
  ghost:
    "inline-flex items-center gap-2 font-sans text-[0.85rem] font-semibold tracking-[0.04em] text-ruby underline underline-offset-[3px] hover:text-oxblood",
};

const disabledStyles =
  "bg-line text-muted border-line cursor-not-allowed hover:bg-line";

export function buttonClasses(
  variant: ButtonVariant = "primary",
  className = "",
): string {
  const isGhost = variant === "ghost";
  return `${isGhost ? "" : base} ${variants[variant]} ${className}`.trim();
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  /*
   * When disabled, the variant's colour utilities are replaced rather than appended.
   * Appending would leave two competing background utilities in the class list, and Tailwind
   * resolves those by stylesheet order rather than by the order they are written — so the
   * button could still render ruby while being genuinely disabled.
   */
  const classes = disabled
    ? `${base} ${sizing} ${disabledStyles} ${className}`.trim()
    : buttonClasses(variant, className);

  return (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
}

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: ButtonVariant;
  children: ReactNode;
};

export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link href={href} className={buttonClasses(variant, className)} {...props}>
      {children}
    </Link>
  );
}

export default Button;
