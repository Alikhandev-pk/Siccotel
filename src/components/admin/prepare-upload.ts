import { ALLOWED_IMAGE_TYPES, formatBytes, MAX_DISPLAY_WIDTH, MAX_UPLOAD_BYTES } from "@/lib/cms/limits";

export type PreparedUpload = {
  file: File;
  original: { name: string; size: number; width?: number; height?: number };
  /** Set when the file had to be resized or compressed to fit the upload limit. */
  optimized?: { size: number; width: number; height: number; type: string };
};

/** Long edges tried in turn, never larger than the original. The first is the widest size the site serves. */
const LONG_EDGES = [MAX_DISPLAY_WIDTH, 3200, 2560];
const QUALITIES = [0.92, 0.88, 0.84, 0.8];

/**
 * Returns a file the server will accept. Files within the upload limit are sent
 * unchanged. Larger photos are scaled down (aspect ratio kept, never past the
 * widest size the site serves first) and re-encoded: JPEG for opaque images,
 * WebP where there is transparency. Throws a readable error if even the
 * smallest attempt is over the limit.
 */
export async function prepareImageForUpload(file: File): Promise<PreparedUpload> {
  const original = { name: file.name, size: file.size };
  if (file.type && !ALLOWED_IMAGE_TYPES[file.type]) throw new Error(`“${file.name}” is not a JPEG, PNG, WebP, AVIF or GIF image.`);
  if (file.size <= MAX_UPLOAD_BYTES) return { file, original };
  if (file.type === "image/gif") {
    throw new Error(`“${file.name}” is ${formatBytes(file.size)}, over the ${formatBytes(MAX_UPLOAD_BYTES)} limit. GIFs can’t be shrunk here without losing their animation; export a smaller GIF, or a JPEG or WebP still.`);
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error(`“${file.name}” could not be read as an image, so it can’t be shrunk to fit the ${formatBytes(MAX_UPLOAD_BYTES)} limit.`);
  }
  try {
    const { width, height } = bitmap;
    const longEdge = Math.max(width, height);
    const transparent = file.type !== "image/jpeg" && hasTransparency(bitmap);
    const formats = transparent ? ["image/webp"] : ["image/jpeg"];
    let smallest: { blob: Blob; width: number; height: number } | null = null;

    for (const edge of [...new Set(LONG_EDGES.map((e) => Math.min(e, longEdge)))]) {
      const scale = edge / longEdge;
      const w = Math.max(1, Math.round(width * scale));
      const h = Math.max(1, Math.round(height * scale));
      const canvas = resize(bitmap, w, h);
      for (const type of formats) {
        for (const quality of QUALITIES) {
          const blob = await toBlob(canvas, type, quality);
          // A browser that cannot write WebP falls back to PNG; keep looking rather than send that.
          if (blob.type !== type) continue;
          if (!smallest || blob.size < smallest.blob.size) smallest = { blob, width: w, height: h };
          if (blob.size <= MAX_UPLOAD_BYTES) {
            const name = `${file.name.replace(/\.[^.]+$/, "") || "image"}.${ALLOWED_IMAGE_TYPES[type]}`;
            return {
              file: new File([blob], name, { type, lastModified: file.lastModified }),
              original: { ...original, width, height },
              optimized: { size: blob.size, width: w, height: h, type },
            };
          }
        }
      }
    }
    const tried = smallest ? ` Even resized to ${smallest.width} × ${smallest.height} px and compressed, it is ${formatBytes(smallest.blob.size)}.` : "";
    throw new Error(`“${file.name}” is ${formatBytes(file.size)}, over the ${formatBytes(MAX_UPLOAD_BYTES)} upload limit.${tried} Export it as a JPEG or WebP under ${formatBytes(MAX_UPLOAD_BYTES)} and upload that instead.`);
  } finally {
    bitmap.close();
  }
}

/** One line for the admin: what was changed, or nothing when the file was sent as chosen. */
export function describeUpload({ original, optimized }: PreparedUpload) {
  if (!optimized) return "";
  const format = optimized.type === "image/webp" ? "WebP" : "JPEG";
  const resized = original.width && (original.width !== optimized.width || original.height !== optimized.height)
    ? `resized from ${original.width} × ${original.height} to ${optimized.width} × ${optimized.height} px`
    : `kept at ${optimized.width} × ${optimized.height} px`;
  return `“${original.name}” was ${formatBytes(original.size)}, over the ${formatBytes(MAX_UPLOAD_BYTES)} limit: optimized to ${formatBytes(optimized.size)} (${resized}, ${format}).`;
}

/** Scales in halving steps, then once to the exact size, so large reductions stay sharp. */
function resize(source: CanvasImageSource & { width: number; height: number }, width: number, height: number) {
  let current: CanvasImageSource = source;
  let cw = source.width;
  let ch = source.height;
  while (cw / 2 >= width && ch / 2 >= height) {
    cw = Math.round(cw / 2);
    ch = Math.round(ch / 2);
    current = draw(current, cw, ch);
  }
  return draw(current, width, height);
}

function draw(source: CanvasImageSource, width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser can’t resize images. Upload a file under the limit instead.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, width, height);
  return canvas;
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("The browser could not encode the image."))), type, quality));
}

/** True when any pixel of a small preview is not fully opaque. */
function hasTransparency(bitmap: ImageBitmap) {
  const scale = Math.min(1, 512 / Math.max(bitmap.width, bitmap.height));
  const canvas = draw(bitmap, Math.max(1, Math.round(bitmap.width * scale)), Math.max(1, Math.round(bitmap.height * scale)));
  const data = canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height).data;
  for (let i = 3; i < data.length; i += 4) if (data[i] < 255) return true;
  return false;
}
