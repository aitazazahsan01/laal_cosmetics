import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { loginAction } from "@/app/actions/admin/auth";
import { getCurrentAdmin, GENERIC_LOGIN_ERROR } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

/**
 * Admin sign-in.
 *
 * Sits outside the (dashboard) route group so it is reachable while signed out.
 *
 * The error message is always the same regardless of what went wrong — unknown email, wrong
 * password, or a deactivated account all produce GENERIC_LOGIN_ERROR, so this form cannot be
 * used to discover which addresses are real staff accounts.
 */
export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    email?: string;
    next?: string;
    loggedOut?: string;
    reset?: string;
  }>;
}) {
  const params = await searchParams;

  // Already signed in — no reason to show the form again.
  if (await getCurrentAdmin()) redirect(params.next ?? "/admin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-blush/40 px-5 py-16">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/LAAL_lockup-1.svg"
            alt="LAAL"
            width={40}
            height={46}
            className="h-[46px] w-auto"
          />
          <span className="mt-3 text-[0.72rem] font-bold uppercase tracking-label text-ruby">
            Admin
          </span>
        </div>

        <div className="rounded-card border border-line bg-white p-8">
          <h1 className="font-serif text-[1.4rem] text-oxblood">Sign in</h1>

          {params.loggedOut ? (
            <p
              role="status"
              className="mt-4 rounded border border-line bg-blush px-3 py-2 text-[0.85rem] text-oxblood"
            >
              You&rsquo;ve been signed out.
            </p>
          ) : null}

          {params.reset ? (
            <p
              role="status"
              className="mt-4 rounded border border-line bg-blush px-3 py-2 text-[0.85rem] text-oxblood"
            >
              Password updated. Sign in with your new password.
            </p>
          ) : null}

          {params.error ? (
            <p
              role="alert"
              className="mt-4 rounded border border-ruby bg-ruby/[0.06] px-3 py-2 text-[0.85rem] text-ruby"
            >
              {GENERIC_LOGIN_ERROR}
            </p>
          ) : null}

          <form action={loginAction} className="mt-6">
            <input type="hidden" name="next" value={params.next ?? "/admin"} />

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
              defaultValue={params.email ?? ""}
              className="mb-4 w-full rounded border border-line bg-white px-3 py-2 text-[0.95rem] focus:border-ruby focus:outline-none"
            />

            <label
              htmlFor="password"
              className="mb-[0.35rem] block text-[0.72rem] uppercase tracking-[0.08em] text-muted"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mb-6 w-full rounded border border-line bg-white px-3 py-2 text-[0.95rem] focus:border-ruby focus:outline-none"
            />

            <button
              type="submit"
              className="w-full rounded-btn bg-ruby px-6 py-3 text-[0.78rem] font-bold uppercase tracking-button text-white hover:bg-oxblood"
            >
              Sign in
            </button>
          </form>

          <Link
            href="/admin/forgot-password"
            className="mt-5 block text-center text-[0.82rem] text-ruby underline underline-offset-[3px] hover:text-oxblood"
          >
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  );
}
