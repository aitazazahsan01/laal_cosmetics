import type { Metadata } from "next";
import Link from "next/link";

import { requestPasswordResetAction } from "@/app/actions/admin/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reset admin password",
  robots: { index: false, follow: false },
};

/**
 * Password reset request.
 *
 * Always reports the same thing whether or not the address belongs to an admin, so this form
 * cannot be used to enumerate staff accounts. The token itself is real (hashed, expiring,
 * single-use — see lib/auth.ts); only the email delivery is stubbed.
 */
export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-blush/40 px-5 py-16">
      <div className="w-full max-w-[400px] rounded-card border border-line bg-white p-8">
        <h1 className="font-serif text-[1.4rem] text-oxblood">
          Reset your password
        </h1>

        {params.sent ? (
          <>
            <p
              role="status"
              className="mt-5 rounded border border-line bg-blush px-4 py-3 text-[0.88rem] text-oxblood"
            >
              If that address belongs to a LAAL admin account, a reset link is on
              its way. The link expires in one hour.
            </p>
            <p className="mt-4 rounded border border-dashed border-ruby bg-ruby/[0.05] px-4 py-3 text-[0.8rem] text-ruby">
              Email delivery is not wired up yet, so no message will actually
              arrive. The reset token is generated and stored correctly — see
              sendPasswordResetEmail in lib/email.ts.
            </p>
          </>
        ) : (
          <>
            <p className="mt-3 text-[0.88rem] text-muted">
              Enter your admin email and we&rsquo;ll send a reset link.
            </p>

            <form action={requestPasswordResetAction} className="mt-6">
              <label
                htmlFor="email"
                className="mb-[0.35rem] block text-[0.72rem] uppercase tracking-[0.08em] text-muted"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="username"
                className="mb-6 w-full rounded border border-line bg-white px-3 py-2 text-[0.95rem] focus:border-ruby focus:outline-none"
              />
              <button
                type="submit"
                className="w-full rounded-btn bg-ruby px-6 py-3 text-[0.78rem] font-bold uppercase tracking-button text-white hover:bg-oxblood"
              >
                Send reset link
              </button>
            </form>
          </>
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
