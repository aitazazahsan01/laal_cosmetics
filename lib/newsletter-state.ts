/**
 * Newsletter form action-state shape, kept outside app/actions/newsletter.ts on purpose: a
 * module marked "use server" may only export async functions, so exporting a plain
 * initial-state object from there ships it to the client as a server-action reference and it
 * arrives as `undefined` — see lib/form-state.ts for the same rule applied to the other forms.
 */

export type NewsletterFormState = {
  status: "idle" | "error" | "success";
  message: string | null;
};

export const initialNewsletterState: NewsletterFormState = {
  status: "idle",
  message: null,
};
