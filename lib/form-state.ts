/**
 * Shared action-state shapes for the public forms.
 *
 * These live outside the "use server" modules on purpose: a module marked "use server" may
 * only export async functions, so exporting a plain initial-state object from there ships it
 * to the client as a server-action reference and it arrives as `undefined`.
 */

export type FormState = {
  status: "idle" | "error" | "success";
  message: string | null;
  fieldErrors: Record<string, string>;
};

export const initialFormState: FormState = {
  status: "idle",
  message: null,
  fieldErrors: {},
};

/** Business types offered on the stockist form. Mirrors the doc comment in the schema. */
export const BUSINESS_TYPES = [
  { value: "CLINIC", label: "Clinic" },
  { value: "SALON", label: "Salon" },
  { value: "PHARMACY", label: "Pharmacy" },
  { value: "DISTRIBUTOR", label: "Distributor" },
  { value: "OTHER", label: "Other" },
] as const;
