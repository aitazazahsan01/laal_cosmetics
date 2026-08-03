import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Payment screenshot storage.
 *
 * STORAGE NOTE — mirrors the SQLite→Postgres note in prisma/schema.prisma.
 * Files are written to a gitignored `/uploads` directory at the project root for local
 * development, because no Cloudflare R2 credentials exist yet. `paymentScreenshotUrl` stores
 * the returned relative path.
 *
 * To move to R2 in production, only `savePaymentScreenshot` changes: upload the buffer to the
 * bucket and return the object key or signed URL. The call site and the stored column need no
 * changes.
 *
 * Note that `/uploads` is deliberately OUTSIDE `public/`, so payment screenshots are not
 * served to the open internet. The admin panel will read them through an authenticated route
 * in a later phase.
 */

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; reason: string };

/**
 * Writes an uploaded image into a subdirectory of /uploads and returns its relative path.
 *
 * Everything under /uploads is served only through the authenticated
 * /api/admin/uploads/[...path] route — nothing here is publicly reachable.
 */
async function saveUpload(file: File, subdir: string): Promise<UploadResult> {
  if (!file || file.size === 0) {
    return { ok: false, reason: "No file received." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, reason: "That file is larger than 5 MB." };
  }

  const extension = ALLOWED[file.type];
  if (!extension) {
    return { ok: false, reason: "Upload a JPG, PNG or WebP image." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // The filename is generated, never taken from the upload, so a crafted name cannot
  // traverse out of the directory or overwrite an existing file.
  const filename = `${randomUUID()}.${extension}`;
  const directory = path.join(UPLOAD_DIR, subdir);

  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), buffer);

  return { ok: true, url: `/uploads/${subdir}/${filename}` };
}

export function savePaymentScreenshot(file: File): Promise<UploadResult> {
  return saveUpload(file, "payments");
}

export function saveProductImage(file: File): Promise<UploadResult> {
  return saveUpload(file, "products");
}

/**
 * Resolves a stored upload path to an absolute file path, refusing anything that escapes the
 * uploads directory. Used by the authenticated read route.
 */
export function resolveUploadPath(segments: string[]): string | null {
  const candidate = path.resolve(UPLOAD_DIR, ...segments);
  const root = path.resolve(UPLOAD_DIR);

  // Reject traversal: the resolved path must sit inside the uploads root.
  if (candidate !== root && !candidate.startsWith(root + path.sep)) return null;

  return candidate;
}

export const UPLOAD_ROOT = UPLOAD_DIR;
