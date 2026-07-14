import type { ReactNode } from "react";

/**
 * Shared form primitives — used by checkout, the stockist enquiry and the contact form so
 * every input on the site has the same label treatment, focus ring and error styling.
 */

export function inputClass(hasError: boolean): string {
  return `w-full rounded border bg-white px-[0.9rem] py-3 text-base text-ink focus:outline-none ${
    hasError ? "border-ruby" : "border-line focus:border-ruby"
  }`;
}

export function FieldLabel({
  htmlFor,
  optional,
  children,
}: {
  htmlFor: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-[0.4rem] block text-[0.76rem] uppercase tracking-[0.08em] text-muted"
    >
      {children}
      {optional ? (
        <span className="ml-1 normal-case tracking-normal">(optional)</span>
      ) : null}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-[0.78rem] text-ruby">{message}</p>;
}

export function TextField({
  name,
  label,
  type = "text",
  placeholder,
  autoComplete,
  required,
  optional,
  error,
  className = "",
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <FieldLabel htmlFor={name} optional={optional}>
        {label}
      </FieldLabel>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className={inputClass(Boolean(error))}
      />
      <FieldError message={error} />
    </div>
  );
}

export function TextAreaField({
  name,
  label,
  rows = 3,
  placeholder,
  required,
  optional,
  error,
  className = "",
}: {
  name: string;
  label: string;
  rows?: number;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <FieldLabel htmlFor={name} optional={optional}>
        {label}
      </FieldLabel>
      <textarea
        id={name}
        name={name}
        rows={rows}
        placeholder={placeholder}
        required={required}
        className={inputClass(Boolean(error))}
      />
      <FieldError message={error} />
    </div>
  );
}

export function SelectField({
  name,
  label,
  options,
  defaultValue,
  required,
  error,
  placeholder,
  className = "",
}: {
  name: string;
  label: string;
  options: readonly { value: string; label: string }[];
  defaultValue?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <select
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue ?? (placeholder ? "" : undefined)}
        className={inputClass(Boolean(error))}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldError message={error} />
    </div>
  );
}
