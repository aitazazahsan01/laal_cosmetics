import Link from "next/link";

import { logoutAction } from "@/app/actions/admin/auth";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Guarded admin shell.
 *
 * Everything under this route group requires a valid session. `requireAdmin()` is the
 * authoritative check — middleware only confirmed a cookie was present, which a forged value
 * would also satisfy.
 *
 * The login and password-reset screens deliberately sit OUTSIDE this group (app/admin/login,
 * app/admin/forgot-password, app/admin/reset-password) so they are reachable while signed out.
 */

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/discounts", label: "Discounts" },
  { href: "/admin/stockists", label: "Stockists" },
  { href: "/admin/contact", label: "Messages" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-blush/40">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4 px-5 py-3">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/LAAL_lockup-1.svg"
              alt="LAAL"
              width={26}
              height={30}
              className="h-[30px] w-auto"
            />
            <span className="text-[0.72rem] font-bold uppercase tracking-label text-ruby">
              Admin
            </span>
          </div>

          <div className="flex items-center gap-4 text-[0.8rem]">
            <span className="text-muted">
              {admin.name}{" "}
              <span className="text-[0.7rem] uppercase tracking-[0.08em]">
                ({admin.role})
              </span>
            </span>
            <Link href="/" className="text-muted hover:text-ruby">
              View site →
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded border border-line px-3 py-[0.35rem] text-[0.72rem] font-bold uppercase tracking-nav text-oxblood hover:border-ruby hover:text-ruby"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1240px] flex-col gap-8 px-5 py-8 lg:flex-row">
        <nav aria-label="Admin" className="lg:w-[180px] lg:flex-none">
          <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded px-3 py-2 text-[0.85rem] font-semibold text-ink hover:bg-white hover:text-ruby"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
