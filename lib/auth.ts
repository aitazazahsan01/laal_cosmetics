import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

import type { AdminUser } from "@prisma/client";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

/**
 * Admin authentication.
 *
 * Design notes:
 *  - Passwords are bcrypt-hashed. Plaintext is never stored, never logged, never returned
 *    from any function here, and never put in an error message.
 *  - Sessions are server-side rows keyed by the SHA-256 hash of a random 32-byte token. The
 *    raw token exists only in the httpOnly cookie, so a database leak cannot be replayed,
 *    and logout / password reset can revoke sessions instantly.
 *  - Login failures are deliberately indistinguishable: the same generic message for an
 *    unknown email, a wrong password and a deactivated account, and a dummy bcrypt compare
 *    runs when the email is unknown so response timing does not reveal existence either.
 */

const SESSION_COOKIE = "laal_admin_session";
const SESSION_DAYS = 7;
const RESET_TOKEN_MINUTES = 60;
const BCRYPT_ROUNDS = 12;

/**
 * A real bcrypt hash of a random value, compared against when the email is unknown so the
 * unknown-email path costs the same as the wrong-password path.
 */
const DUMMY_HASH = bcrypt.hashSync("laal-timing-equaliser", BCRYPT_ROUNDS);

export const GENERIC_LOGIN_ERROR = "Invalid email or password.";

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function constantTimeEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/* ------------------------------------------------------------------ *
 * Sessions
 * ------------------------------------------------------------------ */

export async function createSession(
  adminUserId: string,
  userAgent?: string | null,
): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.adminSession.create({
    data: {
      tokenHash: sha256(token),
      adminUserId,
      expiresAt,
      userAgent: userAgent?.slice(0, 255) ?? null,
    },
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export type SessionAdmin = Pick<
  AdminUser,
  "id" | "email" | "name" | "role" | "isActive"
>;

/**
 * Resolves the current admin from the session cookie, or null.
 *
 * This is the authoritative check. Middleware only tests for the cookie's presence so it can
 * redirect fast at the edge; it cannot validate a forged value, so every protected page,
 * server action and route handler must call this (or requireAdmin) itself.
 */
export async function getCurrentAdmin(): Promise<SessionAdmin | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: sha256(token) },
    include: { adminUser: true },
  });

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await prisma.adminSession.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  if (!session.adminUser.isActive) return null;

  // Best-effort activity stamp; never block a request on it.
  prisma.adminSession
    .update({ where: { id: session.id }, data: { lastSeenAt: new Date() } })
    .catch(() => {});

  const { id, email, name, role, isActive } = session.adminUser;
  return { id, email, name, role, isActive };
}

/** For pages and layouts: redirects to the login screen when not signed in. */
export async function requireAdmin(returnTo?: string): Promise<SessionAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    const target = returnTo
      ? `/admin/login?next=${encodeURIComponent(returnTo)}`
      : "/admin/login";
    redirect(target);
  }
  return admin;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (token) {
    await prisma.adminSession
      .deleteMany({ where: { tokenHash: sha256(token) } })
      .catch(() => {});
  }

  store.delete(SESSION_COOKIE);
}

/* ------------------------------------------------------------------ *
 * Login
 * ------------------------------------------------------------------ */

export type LoginResult =
  | { ok: true; adminUserId: string }
  | { ok: false; error: string };

export async function authenticate(
  email: string,
  password: string,
): Promise<LoginResult> {
  const normalised = email.trim().toLowerCase();

  const admin = await prisma.adminUser.findUnique({
    where: { email: normalised },
  });

  if (!admin) {
    // Spend the same time as a real comparison so timing cannot reveal whether the
    // address exists.
    await bcrypt.compare(password, DUMMY_HASH);
    return { ok: false, error: GENERIC_LOGIN_ERROR };
  }

  const valid = await verifyPassword(password, admin.passwordHash);

  // A deactivated account returns the same message as a wrong password on purpose.
  if (!valid || !admin.isActive) {
    return { ok: false, error: GENERIC_LOGIN_ERROR };
  }

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  });

  return { ok: true, adminUserId: admin.id };
}

/* ------------------------------------------------------------------ *
 * Password reset
 * ------------------------------------------------------------------ */

/**
 * Issues a reset token. Returns the raw token so the (stubbed) email can carry it — it is
 * never persisted in raw form and never logged.
 *
 * Returns null when the email is unknown; callers must still report success to the user, so
 * the reset form cannot be used to enumerate admin accounts.
 */
export async function createPasswordResetToken(
  email: string,
): Promise<{ token: string; admin: AdminUser } | null> {
  const admin = await prisma.adminUser.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (!admin || !admin.isActive) return null;

  const token = randomBytes(32).toString("base64url");

  await prisma.adminPasswordResetToken.create({
    data: {
      tokenHash: sha256(token),
      adminUserId: admin.id,
      expiresAt: new Date(Date.now() + RESET_TOKEN_MINUTES * 60 * 1000),
    },
  });

  return { token, admin };
}

export type ResetResult = { ok: true } | { ok: false; error: string };

/**
 * Consumes a reset token and sets a new password.
 *
 * On success every existing session for that admin is destroyed — a password reset should
 * log out anyone already holding a session, including an attacker.
 */
export async function resetPasswordWithToken(
  rawToken: string,
  newPassword: string,
): Promise<ResetResult> {
  if (newPassword.length < 10) {
    return { ok: false, error: "Choose a password of at least 10 characters." };
  }

  const record = await prisma.adminPasswordResetToken.findUnique({
    where: { tokenHash: sha256(rawToken) },
  });

  const invalid = { ok: false as const, error: "That reset link is invalid or has expired." };

  if (!record) return invalid;
  if (record.usedAt) return invalid;
  if (record.expiresAt < new Date()) return invalid;
  if (!constantTimeEquals(record.tokenHash, sha256(rawToken))) return invalid;

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.adminUser.update({
      where: { id: record.adminUserId },
      data: { passwordHash },
    }),
    prisma.adminPasswordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.adminSession.deleteMany({ where: { adminUserId: record.adminUserId } }),
  ]);

  return { ok: true };
}

export { SESSION_COOKIE };
