import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge middleware.
 *
 * Two jobs:
 *
 * 1. Gate the admin area. Every /admin/* and /api/admin/* route is blocked unless a session
 *    cookie is present — including the CSV export and the payment-screenshot read route.
 *    Only the login and password-reset screens are exempt, because they are how you get in.
 *
 *    This is a FAST REJECT, not the authorisation check. Middleware runs on the Edge runtime
 *    and cannot reach Prisma, so it can only see that a cookie exists — not that it is valid.
 *    The authoritative check is getCurrentAdmin()/requireAdmin() in lib/auth.ts, which every
 *    protected page, layout, server action and route handler calls for itself. A forged
 *    cookie gets past this and is rejected there.
 *
 * 2. Publish the request path as a header so the root layout can tell storefront pages from
 *    admin pages and skip the storefront chrome on admin screens.
 */

const SESSION_COOKIE = "laal_admin_session";

/** Reachable without a session — otherwise nobody could ever sign in. */
const PUBLIC_ADMIN_PATHS = [
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-laal-pathname", pathname);

  const isAdminArea =
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/api/admin/");

  const isPublicAdmin = PUBLIC_ADMIN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (isAdminArea && !isPublicAdmin) {
    const hasSessionCookie = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

    if (!hasSessionCookie) {
      // API routes get a status code, not a redirect to an HTML page.
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401, headers: { "cache-control": "no-store" } },
        );
      }

      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.search = `?next=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
