import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

/**
 * Upload storage: payment screenshots (private) and product photos (public).
 *
 * STORAGE NOTE — mirrors the SQLite→Postgres note in prisma/schema.prisma.
 *
 * Payment screenshots (`savePaymentScreenshot`) always write to a gitignored `/uploads`
 * directory at the project root, OUTSIDE `public/`, and are only ever served through the
 * authenticated `/api/admin/uploads/[...path]` route. This does not change even once R2 is
 * configured below: R2 is public-by-default in this setup, and uploading payment screenshots
 * there without signed URLs would make them readable by anyone with the link — a real privacy
 * regression from today's authenticated-only behaviour. If real production R2 access for
 * payment screenshots is wanted later, it needs signed URLs (more setup than fits here), so
 * for now they deliberately stay on local disk even in production, which — see below — is
 * itself a known limitation on Vercel.
 *
 * Product photos (`saveProductImage`) are meant to be public (they render on the storefront),
 * so:
 *  - Without R2 credentials, they write to a gitignored `public/uploads/products/` directory,
 *    which Next's static file serving reaches directly with no auth — fixing a real bug where
 *    they used to land in the private `/uploads` tree (see git history / project notes) and
 *    would 401 for real customers.
 *  - DEV-ONLY CAVEAT: on Vercel's serverless filesystem, writes to disk at runtime do not
 *    persist between invocations — this local-disk path only works for local development. Real
 *    production use requires R2 to be configured below.
 *  - With all five R2_* vars set, they instead upload to the `products/` prefix of the R2
 *    bucket and return a URL built from R2_PUBLIC_BASE_URL, which does persist in production.
 */

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const PUBLIC_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; reason: string };

/* ------------------------------------------------------------------ *
 * Cloudflare R2 (S3-compatible)
 * ------------------------------------------------------------------ */

const r2AccountId = process.env.R2_ACCOUNT_ID;
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const r2BucketName = process.env.R2_BUCKET_NAME;
const r2PublicBaseUrl = process.env.R2_PUBLIC_BASE_URL;

const R2_CONFIGURED = Boolean(
  r2AccountId &&
    r2AccessKeyId &&
    r2SecretAccessKey &&
    r2BucketName &&
    r2PublicBaseUrl,
);

let r2Client: S3Client | null = null;
function getR2Client(): S3Client {
  if (!r2Client) {
    r2Client = new S3Client({
      region: "auto",
      endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: r2AccessKeyId as string,
        secretAccessKey: r2SecretAccessKey as string,
      },
    });
  }
  return r2Client;
}

async function saveToR2(
  buffer: Buffer,
  key: string,
  contentType: string,
): Promise<UploadResult> {
  try {
    await getR2Client().send(
      new PutObjectCommand({
        Bucket: r2BucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );
    const base = (r2PublicBaseUrl as string).replace(/\/$/, "");
    return { ok: true, url: `${base}/${key}` };
  } catch (error) {
    console.error("[uploads] R2 upload failed:", error);
    return { ok: false, reason: "Upload to storage failed. Please try again." };
  }
}

/* ------------------------------------------------------------------ *
 * Shared validation
 * ------------------------------------------------------------------ */

function validate(file: File): { extension: string } | { error: string } {
  if (!file || file.size === 0) return { error: "No file received." };
  if (file.size > MAX_BYTES) return { error: "That file is larger than 5 MB." };
  const extension = ALLOWED[file.type];
  if (!extension) return { error: "Upload a JPG, PNG or WebP image." };
  return { extension };
}

/* ------------------------------------------------------------------ *
 * Payment screenshots — always private, always local disk (see note above)
 * ------------------------------------------------------------------ */

/**
 * Writes an uploaded payment screenshot into /uploads/payments and returns its relative path.
 * Served only through the authenticated /api/admin/uploads/[...path] route — never public,
 * even once R2 is configured (see the storage note at the top of this file).
 */
export async function savePaymentScreenshot(file: File): Promise<UploadResult> {
  const validated = validate(file);
  if ("error" in validated) return { ok: false, reason: validated.error };

  const buffer = Buffer.from(await file.arrayBuffer());

  // The filename is generated, never taken from the upload, so a crafted name cannot
  // traverse out of the directory or overwrite an existing file.
  const filename = `${randomUUID()}.${validated.extension}`;
  const directory = path.join(UPLOAD_DIR, "payments");

  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), buffer);

  return { ok: true, url: `/uploads/payments/${filename}` };
}

/* ------------------------------------------------------------------ *
 * Product photos — public, R2 when configured, else public/uploads/products
 * ------------------------------------------------------------------ */

/**
 * Writes an uploaded product photo and returns a URL reachable by anyone, no authentication —
 * these render on the storefront. Uploads to R2 (`products/` prefix) when R2 is fully
 * configured; otherwise writes into the gitignored `public/uploads/products/` directory,
 * which Next serves directly. See the DEV-ONLY caveat in the file-level comment above: the
 * local-disk fallback does not persist on Vercel's serverless filesystem.
 */
export async function saveProductImage(file: File): Promise<UploadResult> {
  const validated = validate(file);
  if ("error" in validated) return { ok: false, reason: validated.error };

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${randomUUID()}.${validated.extension}`;

  if (R2_CONFIGURED) {
    return saveToR2(buffer, `products/${filename}`, file.type);
  }

  const directory = path.join(PUBLIC_UPLOAD_DIR, "products");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), buffer);

  return { ok: true, url: `/uploads/products/${filename}` };
}

/**
 * Resolves a stored PRIVATE upload path (payments only) to an absolute file path, refusing
 * anything that escapes the uploads directory. Used by the authenticated read route.
 */
export function resolveUploadPath(segments: string[]): string | null {
  const candidate = path.resolve(UPLOAD_DIR, ...segments);
  const root = path.resolve(UPLOAD_DIR);

  // Reject traversal: the resolved path must sit inside the uploads root.
  if (candidate !== root && !candidate.startsWith(root + path.sep)) return null;

  return candidate;
}

export const UPLOAD_ROOT = UPLOAD_DIR;
