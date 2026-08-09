# Project Progress

**Last updated:** 2026-08-08
**Status:** Core build complete (Phases 1–5 of the build plan). Live and independently verified against a real production build. Waiting on real-world credentials and a handful of outstanding content items from LAAL before the remaining pending features go live.

This file is the working status tracker for the build — updated alongside each phase rather than written once at the end. If you're picking this project back up after a gap, read this before assuming anything about what exists.

---

## What's done

### Storefront
- Home, Shop, both product pages (Niacinamide+, Hyaluronic+ — one shared template), About, Ingredients, Stockists, Contact, and four policy pages (Shipping, Returns, Privacy, Terms)
- Real product photography wired in everywhere a product renders (product galleries, shop/home cards, the cross-sell "pairs with" card, cart line items)
- Real prices with strikethrough list pricing (`Rs. 2,099` → `Rs. 1,784`), real delivery fee/threshold/COD surcharge, real WhatsApp number and Easypaisa account, real address
- Real page copy throughout: hero, trust strip, "why LAAL," About page brand story, all four policy pages, a shared 12-question FAQ on both product pages, exact SEO title/description pairs on six pages
- Ingredients page actives/exclusions are **computed at render time** from the seeded INCI data, not hand-typed — a reformulation would change the claims automatically instead of silently going stale

### Cart & checkout
- httpOnly cookie cart; the server always re-prices from the database, the client can never influence a total (adversarially tested — posting a fake total/discount/delivery fee from outside the app is fully ignored)
- Guest-only checkout, four payment methods (Cash on Delivery, Easypaisa, JazzCash, bank transfer), payment-screenshot upload
- Transactional stock decrement (tested two simultaneous orders against 1 unit of stock — exactly one won, stock never went negative)

### Admin panel
- Hand-rolled auth: bcrypt-12, DB-backed sessions storing only a hash of the session token, generic errors that don't distinguish "wrong password" from "no such account," single-use hashed password-reset tokens
- Orders (filter/search/status/tracking/notes/screenshot/CSV export, manual WhatsApp-dispatch button), Products (price, list price, stock, images), Discounts (CRUD), Stockists & Contact triage, Settings (delivery fee/threshold/COD surcharge)

### Security & abuse protection
- DB-backed rate limiting (chosen over in-memory specifically because the confirmed hosting target is Vercel serverless, where in-memory state doesn't survive between invocations): admin login (by IP and by email independently), contact/stockist forms, discount-code guessing
- Honeypot field on both public forms
- Path-traversal-safe authenticated upload route for payment screenshots

### Integrations — built and wired, inert until configured
Every one of these is fully implemented at the correct call site and does the correct thing the moment its credentials exist. Until then, each falls back to a harmless no-op — never a crash, never a fake send, never invented data.

| Integration | Status | Needs |
|---|---|---|
| Email (Resend) | Code complete | `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_NOTIFICATION_EMAIL` |
| File storage (Cloudflare R2) | Code complete | `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_BASE_URL` |
| Analytics (GA4) | Code complete | `NEXT_PUBLIC_GA4_ID` |
| Analytics (Meta Pixel) | Code complete | `NEXT_PUBLIC_META_PIXEL_ID` |

---

## What's still pending — and why

### Waiting on credentials (from the user)
- **Resend** — needs an account, a verified sending domain, and an API key
- **A real receiving email address** — LAAL has never supplied *any* email address; `ADMIN_NOTIFICATION_EMAIL` and `CONTACT_EMAIL` (`lib/config.ts`) are both still `null`. Without this, order/contact/stockist notifications have nowhere to send even once Resend is configured
- **Cloudflare R2** — needs an account and a bucket
- **GA4 measurement ID** and **Meta Pixel ID**
- **Postgres connection string** (Neon or Supabase) — needed for the production database swap. Deliberately *not* started yet: flipping `prisma/schema.prisma`'s provider without a real connection string would break local dev entirely. This is a coordinated step (provider change + new `DATABASE_URL` + fresh migration + reseed) best done together, right before actual deployment

### Waiting on content (from LAAL)
- Manufacturer's registered name (About page "Manufactured by" row)
- Instagram handle (icon is in place in the footer, inert)
- Customer testimonials (none exist anywhere — will never be fabricated)
- JazzCash and bank transfer account details (only Easypaisa's number was supplied)

### Deliberately deferred — needs a decision, not just a credential
- **"The Pair" bundle pricing** — the content pack specifies both serums together at Rs 3,358 (a real ~Rs 210 saving beyond the two items' already-discounted individual prices, not just their sum). The `/shop` page already has a bundle card, correctly showing "Bundle price pending." Implementing this for real means either a new bundle SKU or automatic cart-level pricing logic, and the content pack asks for it to be admin-configurable — real checkout-math changes, held back for a deliberate decision rather than being built into a content pass.

### Not started
- Postgres provider swap + fresh migration (blocked on a real connection string, see above)
- Actual deployment to Vercel
- End-to-end test order placement across all four payment methods on a real device (SRS acceptance criterion)
- Home page load time under 3 seconds on 4G (SRS acceptance criterion) — not yet measured against a deployed instance
- Final handover deliverables: source access, hosting/domain credentials, an admin walkthrough, the agreed bug-fix window

---

## Known judgment calls worth knowing about

- **Rate-limit throttle messages**: the admin-login throttle message is deliberately distinct from the generic auth error (safe, since it depends only on request volume, not account existence) — but the discount-code throttle deliberately looks identical to "code not recognised," since a distinct message would itself confirm code-guessing is a live attack surface worth continuing.
- **Payment screenshots never go to R2**, even once R2 is configured — R2 is public-by-default in this setup, and putting payment screenshots there without signed URLs would be a real privacy regression from today's authenticated-only behaviour. They stay on local disk behind the authenticated admin route permanently, which is itself a known limitation on Vercel's serverless filesystem (see below).
- **Local-disk uploads don't persist in production on Vercel** — writes to disk at runtime don't survive between serverless invocations. Product-photo uploads work locally right now (fixed a real bug where they were landing in a private, admin-only path); they need R2 configured before they'll work for real once deployed.
- **The B3/Pyridoxine "discrepancy"** flagged earlier in the project was a false alarm, not a labelling error — Niacinamide (2nd in Hyaluronic+'s INCI) *is* Vitamin B3, which is what the box's "B3" headline active refers to. No box-art change needed.

---

## How to keep this file useful

Update this alongside memory, not instead of it — this file is for anyone (human or AI) picking the project back up cold; the memory system tracks the same facts for continuity within Claude sessions specifically. When a phase completes or a deferred decision gets made, move it from "pending" to "done" here in the same pass, not as an afterthought.
