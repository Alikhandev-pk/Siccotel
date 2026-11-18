import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/cms/auth";
import { MAX_UPLOAD_BYTES } from "@/lib/cms/config";
import { formatBytes } from "@/lib/cms/limits";

/**
 * The admin shrinks larger photos before sending them, so an oversized file means
 * the page was loaded before that code (or the upload did not come from the admin).
 */
const TOO_LARGE = `Images must be ${formatBytes(MAX_UPLOAD_BYTES)} or smaller. The admin resizes larger photos automatically before upload: reload this page and upload the photo again.`;
import { storeImage } from "@/lib/cms/media-store";

/** Admin-only image upload. The session and admin status are verified before the file is read. */
export async function POST(request: NextRequest) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Not authorized." }, { status: 401 });
  }
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_UPLOAD_BYTES + 64 * 1024) return NextResponse.json({ error: TOO_LARGE }, { status: 413 });
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Send the image as form data." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file was attached." }, { status: 400 });
  if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: TOO_LARGE }, { status: 413 });
  try {
    const image = await storeImage(Buffer.from(await file.arrayBuffer()), file.name, { alt: String(form.get("alt") ?? "").slice(0, 500), userId: admin.userId });
    return NextResponse.json({ image });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Upload failed." }, { status: 422 });
  }
}
