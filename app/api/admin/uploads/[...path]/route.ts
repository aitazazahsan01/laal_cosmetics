import { readFile, stat } from "node:fs/promises";
import path from "node:path";

import { getCurrentAdmin } from "@/lib/auth";
import { resolveUploadPath } from "@/lib/uploads";

export const dynamic = "force-dynamic";

/**
 * Authenticated read access to /uploads.
 *
 * Payment screenshots contain customers' banking references, so the uploads directory
 * deliberately sits outside /public and is not served by the static handler. This is the only
 * way to read those files, and it requires a valid admin session.
 *
 * Two separate protections against path traversal:
 *   1. resolveUploadPath() rejects any path that escapes the uploads root.
 *   2. Segments containing ".." or a path separator are refused before that.
 */

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401, headers: { "cache-control": "no-store" } },
    );
  }

  const { path: segments } = await params;

  if (
    !segments?.length ||
    segments.some(
      (segment) =>
        !segment ||
        segment === "." ||
        segment === ".." ||
        segment.includes("/") ||
        segment.includes("\\") ||
        segment.includes("\0"),
    )
  ) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const absolute = resolveUploadPath(segments);
  if (!absolute) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const extension = path.extname(absolute).toLowerCase();
  const contentType = CONTENT_TYPES[extension];
  if (!contentType) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const info = await stat(absolute);
    if (!info.isFile()) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    const file = await readFile(absolute);

    return new Response(new Uint8Array(file), {
      status: 200,
      headers: {
        "content-type": contentType,
        "content-length": String(info.size),
        // Customer payment data — never cached by a shared proxy.
        "cache-control": "private, no-store",
        "content-disposition": "inline",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
}
