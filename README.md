# LAAL Cosmetics

**[laalcosmetics.com](https://laalcosmetics.com)** — the storefront and admin panel for LAAL, a Pakistani skincare brand selling two face serums built on one idea: print every ingredient, name every concentration, and never sell a fairness claim.

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?logo=prisma) ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)

---

## About

LAAL sells two 30 ml serums — **Niacinamide+** (oil control) and **Hyaluronic+** (barrier repair) — direct to consumers across Pakistan, guest checkout only, no accounts. The whole site is built around one non-negotiable rule inherited from LAAL's own requirements spec: **nothing on this site claims more than LAAL has actually supplied.** Anything LAAL hasn't given us yet — a price, a policy, a photo — renders a visible "pending" state in the UI instead of invented copy. See [`PROGRESS.md`](./PROGRESS.md) for exactly what that currently applies to.

## Features

- **Storefront** — home, two product pages (one shared template, parameterised by slug), shop grid, About, Ingredients (computed from real INCI data, not hand-typed claims), Stockists, Contact, and four policy pages
- **Cart & checkout** — httpOnly cookie cart (server always re-prices from the database, never trusts the client), guest-only checkout, four Pakistani payment methods (COD, Easypaisa, JazzCash, bank transfer) with payment-screenshot upload
- **Admin panel** — hand-rolled session auth (bcrypt-12, hashed DB-backed sessions, generic errors that don't leak which accounts exist), order management with CSV export, product/catalogue editing, discount codes, stockist & contact-message triage, delivery settings
- **Spam & abuse protection** — DB-backed rate limiting on login, public forms, and discount-code guessing; honeypot fields on public forms
- **Integration-ready, not integration-required** — Resend email, Cloudflare R2 uploads, GA4/Meta Pixel analytics are all fully wired to their correct call sites and activate automatically the moment real credentials are supplied; until then every one of them degrades gracefully to a harmless no-op, never a crash or a fake send

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, Server Actions) |
| Language | TypeScript |
| Database | Prisma ORM · Postgres, provisioned via Vercel's Supabase integration (one database shared by local dev and production) |
| Styling | Tailwind CSS, hand-authored design tokens |
| Auth | Hand-rolled — bcrypt + hashed session tokens, no third-party auth provider |
| Email | Resend (inert until `RESEND_API_KEY` is set) |
| File storage | Local disk in dev → Cloudflare R2 in production (inert until `R2_*` vars are set) |
| Hosting target | Vercel |

## Getting started

```bash
npm install
cp .env.example .env      # fill in real values — see the comments in that file
npm run db:push           # create/update the local SQLite schema
npm run db:seed           # seed products, delivery settings, and the two admin accounts
npm run dev
```

Visit `http://localhost:3000` for the storefront and `/admin/login` for the admin panel (credentials come from `ADMIN_1_*`/`ADMIN_2_*` in your `.env`).

### Scripts

| Command | Does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build — **do not run this while `dev` is already running**, they share `.next` and will corrupt each other's cache |
| `npm run start` | Serve a production build |
| `npm run typecheck` | `tsc --noEmit`, safe to run anytime |
| `npm run db:push` | Push schema changes to the DB (additive, safe) |
| `npm run db:seed` | Re-run `prisma/seed.ts` |
| `npm run db:studio` | Prisma Studio, a GUI for the local DB |
| `npm run db:reset` | **Destructive** — wipes and reseeds. Guarded by Prisma's AI-agent consent flow; not something to run casually |

## Environment variables

Every variable is documented inline in [`.env.example`](./.env.example). In short:

- **Required to run at all**: `POSTGRES_PRISMA_URL` + `POSTGRES_URL_NON_POOLING` (get both from the Supabase dashboard, not Vercel's — see `.env.example`), `ADMIN_1_*`/`ADMIN_2_*` (the two staff accounts)
- **Optional, inert until set** — each degrades to a safe no-op or local fallback when absent, never breaks the build: `RESEND_API_KEY` / `EMAIL_FROM` / `ADMIN_NOTIFICATION_EMAIL` (email), `R2_*` (uploads), `NEXT_PUBLIC_GA4_ID` / `NEXT_PUBLIC_META_PIXEL_ID` (analytics)

## Project structure

```
app/                  Routes (App Router) — storefront pages, /admin, /api
  actions/            Server Actions (cart, checkout, contact, stockists, admin/*)
components/           UI, organised by domain (product, cart, checkout, admin, layout, policy, ui)
lib/                  Business logic — pricing, cart, orders, auth, email, uploads, rate limiting, config
prisma/               Schema + seed data
public/brand/         Logo SVGs and product photography
docs/brand/           Source PDFs — SRS, content pack, box artwork, vector logos
```

## Data model

`Product` · `Order` / `OrderItem` · `DiscountCode` · `StockistEnquiry` · `ContactMessage` · `DeliverySettings` (singleton) · `AdminUser` / `AdminSession` / `AdminPasswordResetToken` · `RateLimitHit`

Money is always whole Pakistani Rupees in `Int` columns — never `Float`. JSON-shaped content is stored as a `String` and parsed in `lib/products.ts`; every enum-shaped column is a documented `String` (SQLite doesn't support Prisma enums) with the real union types living in `lib/types.ts`.

## Documentation

- [`PROGRESS.md`](./PROGRESS.md) — current build status: what's done, what's live, what's still pending real credentials or LAAL-supplied content, and what's next
- `docs/brand/LAAL_Website_SRS.pdf` — the requirements spec this build follows
- `docs/brand/LAAL_Website_Content_Pack.pdf` — real product copy, pricing, and page content

## License

Proprietary. All rights reserved — LAAL Cosmetics.
