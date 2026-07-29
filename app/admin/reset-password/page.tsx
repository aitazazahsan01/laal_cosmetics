import type { Metadata } from "next";
import Link from "next/link";

import { resetPasswordAction } from "@/app/actions/admin/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Set a new admin password",
  robots: { index: false, follow: false },
};

/**
 * Set a new password from a reset link.
 *
 * The token is validated server-side in resetPasswordWithToken(): it must exist, be unused,
 * and be unexpired. On success every session for that admin is destroyed, so a reset also
 * evicts anyone already holding a stolen session.
 */
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const params = await searchParams;
  const token = params.token ?? "";

  return (
    <div className="flex min-h-screen items-center justify-center bg-blush/40 px-5 py-16">
      <div className="w-full max-w-[400px] rounded-card border border-line bg-white p-8">
        <h1 className="font-serif text-[1.4rem] text-oxblood">
          Choose a new password
        </h1>

        {params.error ? (
          <p
            role="alert"
            className="mt-4 rounded border border-ruby bg-ruby/[0.06] px-3 py-2 text-[0.85rem] text-ruby"
          >
            {params.error}
          </p>
        ) : null}

        {token ? (
          <form action={resetPasswordAction} className="mt-6">
            <input type="hidden" name="token" value={token} />

            <label
              htmlFor="password"
              className="mb-[0.35rem] block text-[0.72rem] uppercase tracking-[0.08em] text-muted"
            >
              New password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={10}
              autoComplete="new-password"
              className="mb-4 w-full rounded border border-line bg-white px-3 py-2 text-[0.95rem] focus:border-ruby focus:outline-none"
            />

            <label
              htmlFor="confirmPassword"
              className="mb-[0.35rem] block text-[0.72rem] uppercase tracking-[0.08em] text-muted"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={10}
              autoComplete="new-password"
              className="mb-2 w-full rounded border border-line bg-white px-3 py-2 text-[0.95rem] focus:border-ruby focus:outline-none"
            />
            <p className="mb-6 text-[0.75rem] text-muted">
              At least 10 characters. Resetting signs out every other device.
            </p>

            <button
              type="submit"
              className="w-full rounded-btn bg-ruby px-6 py-3 text-[0.78rem] font-bold uppercase tracking-button text-white hover:bg-oxblood"
            >
              Set new password
            </button>
          </form>
        ) : (
          <p className="mt-4 text-[0.88rem] text-muted">
            This link is missing its reset token. Request a new one from the
            forgot-password page.
          </p>
        )}

        <Link
          href="/admin/login"
          className="mt-5 block text-center text-[0.82rem] text-ruby underline underline-offset-[3px] hover:text-oxblood"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
