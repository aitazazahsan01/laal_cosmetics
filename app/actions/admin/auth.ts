"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  authenticate,
  createPasswordResetToken,
  createSession,
  destroySession,
  resetPasswordWithToken,
} from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";
import { SITE } from "@/lib/config";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

/**
 * Admin auth actions.
 *
 * Feedback travels back through the URL rather than action state, so these forms work with
 * JavaScript disabled and no state object is exported from a "use server" module.
 *
 * Errors are always generic — the login screen never distinguishes an unknown email from a
 * wrong password from a deactivated account, and the reset screen always reports success so
 * neither can be used to enumerate staff accounts.
 */

/** Only allow same-site relative paths back into the admin area. */
function safeNext(next: string | null): string {
  if (!next) return "/admin";
  if (!next.startsWith("/admin")) return "/admin";
  if (next.startsWith("//")) return "/admin";
  return next;
}

export async function loginAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(String(formData.get("next") ?? "") || null);

  if (!email || !password) {
    redirect(`/admin/login?error=1&next=${encodeURIComponent(next)}`);
  }

  // Rate-limit on both the requesting IP and the submitted email, independently, before every
  // attempt — success or failure — since the limiter's job is "how many times has this key
  // tried," full stop. This is checked before authenticate() so a throttled attempt never even
  // reaches the bcrypt compare.
  const ip = await getClientIp();
  const [ipLimit, emailLimit] = await Promise.all([
    checkRateLimit(`login:ip:${ip}`, { max: 10, windowMs: 15 * 60 * 1000 }),
    checkRateLimit(`login:email:${email.toLowerCase()}`, {
      max: 5,
      windowMs: 15 * 60 * 1000,
    }),
  ]);

  if (!ipLimit.allowed || !emailLimit.allowed) {
    // Safe to be a distinct message here (unlike the generic auth error): it depends only on
    // request volume, not on whether the account exists, so it doesn't reopen the
    // user-enumeration hole GENERIC_LOGIN_ERROR closes.
    redirect(
      `/admin/login?error=throttled&next=${encodeURIComponent(next)}`,
    );
  }

  const result = await authenticate(email, password);

  if (!result.ok) {
    // Never echo the submitted password back into the URL or the page.
    redirect(
      `/admin/login?error=1&email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`,
    );
  }

  const requestHeaders = await headers();
  await createSession(result.adminUserId, requestHeaders.get("user-agent"));

  redirect(next);
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/admin/login?loggedOut=1");
}

export async function requestPasswordResetAction(
  formData: FormData,
): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();

  const issued = await createPasswordResetToken(email);

  if (issued) {
    const resetUrl = `${SITE.url}/admin/reset-password?token=${issued.token}`;
    try {
      await sendPasswordResetEmail(issued.admin, resetUrl);
    } catch (error) {
      console.error("[admin] reset email stub failed:", error);
    }
  }

  // Always the same response, whether or not the address exists.
  redirect("/admin/forgot-password?sent=1");
}

export async function resetPasswordAction(formData: FormData): Promise<void> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (password !== confirm) {
    redirect(
      `/admin/reset-password?token=${encodeURIComponent(token)}&error=${encodeURIComponent("Those passwords don't match.")}`,
    );
  }

  const result = await resetPasswordWithToken(token, password);

  if (!result.ok) {
    redirect(
      `/admin/reset-password?token=${encodeURIComponent(token)}&error=${encodeURIComponent(result.error)}`,
    );
  }

  redirect("/admin/login?reset=1");
}
