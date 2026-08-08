import { headers } from "next/headers";

import { prisma } from "@/lib/prisma";

/**
 * DB-backed sliding-window rate limiter.
 *
 * Backed by the RateLimitHit table rather than an in-memory counter because the confirmed
 * hosting target is Vercel serverless — in-memory state does not survive across invocations,
 * so an in-memory limiter would silently do nothing in production.
 *
 * Not built for high throughput or perfect efficiency — a `count` plus an `insert`, with an
 * opportunistic prune of old rows on each call, is more than enough for this site's traffic.
 */

export type RateLimitOptions = {
  /** Maximum allowed hits within the window. */
  max: number;
  /** Window length in milliseconds. */
  windowMs: number;
};

export type RateLimitResult = { allowed: boolean };

/**
 * Counts RateLimitHit rows matching `key` created within the last `windowMs`. If under `max`,
 * records this attempt and allows it; otherwise refuses without recording (a refused attempt
 * does not itself count toward the window).
 */
export async function checkRateLimit(
  key: string,
  { max, windowMs }: RateLimitOptions,
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = new Date(now - windowMs);

  // Opportunistic cleanup so the table doesn't grow forever. A few multiples of the window is
  // plenty of margin — this doesn't need to be exact or run on every call to be effective.
  prisma.rateLimitHit
    .deleteMany({ where: { createdAt: { lt: new Date(now - windowMs * 4) } } })
    .catch(() => {});

  const count = await prisma.rateLimitHit.count({
    where: { key, createdAt: { gte: windowStart } },
  });

  if (count >= max) {
    return { allowed: false };
  }

  await prisma.rateLimitHit.create({ data: { key } });
  return { allowed: true };
}

/**
 * Best-effort client IP for rate-limit keys.
 *
 * Vercel sets `x-forwarded-for` reliably on requests it proxies, so this is trustworthy in
 * production. `x-real-ip` is a fallback for other setups, and a literal "unknown" string is
 * the last resort (which still rate-limits — everyone without a detectable IP shares one
 * bucket — rather than throwing or disabling the limiter).
 */
export async function getClientIp(): Promise<string> {
  const requestHeaders = await headers();

  const forwardedFor = requestHeaders.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = requestHeaders.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}
