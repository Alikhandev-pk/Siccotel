/**
 * Upload limits shared by the server (which enforces them) and the admin's
 * browser code (which shrinks oversized photos to fit before sending them).
 * No server-only imports here, so client components can use it.
 */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

/**
 * The widest image the site ever serves: next/image's largest generated width
 * (its default deviceSizes end at 3840). A photo shrunk to this long edge looks
 * the same on every page and screen as the original.
 */
export const MAX_DISPLAY_WIDTH = 3840;

/** "8 MB", "33.4 MB", "640 KB". */
export function formatBytes(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1).replace(/\.0$/, "")} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
