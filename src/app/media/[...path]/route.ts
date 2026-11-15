import fs from "node:fs/promises";
import path from "node:path";
import { connection } from "next/server";
import { resolveUpload } from "@/lib/cms/media-store";

const TYPES: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif", ".gif": "image/gif" };

/** Serves uploaded images from the persistent upload folder. File names are random, so URLs are unguessable. */
export async function GET(_: Request, { params }: { params: Promise<{ path: string[] }> }) {
  await connection();
  const parts = (await params).path;
  const type = TYPES[path.extname(parts.at(-1) ?? "").toLowerCase()];
  if (!type || parts.some((p) => p === ".." || p.includes("\\"))) return new Response("Not found", { status: 404 });
  try {
    const file = await fs.readFile(resolveUpload(parts.join("/")));
    return new Response(new Uint8Array(file), {
      headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
