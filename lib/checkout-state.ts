/**
 * Shape of the checkout form's action state.
 *
 * This lives outside app/actions/checkout.ts on purpose: a module marked "use server" may
 * only export async functions. Exporting a plain object from there makes React treat it as a
 * server-action reference, and it arrives at the client as `undefined` — which crashes the
 * first render of the form rather than failing the build.
 */
export type CheckoutState = {
  error: string | null;
  fieldErrors: Record<string, string>;
};

export const initialCheckoutState: CheckoutState = {
  error: null,
  fieldErrors: {},
};
