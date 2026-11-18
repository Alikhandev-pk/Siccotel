"use client";

import { useRef, useState } from "react";
import { ImagePlus, Upload, X } from "lucide-react";
import { formatBytes, MAX_UPLOAD_BYTES } from "@/lib/cms/limits";
import type { CmsImage } from "@/lib/cms/types";
import { describeUpload, prepareImageForUpload } from "./prepare-upload";

export type MediaAsset = { id: string; url: string; width: number; height: number; alt: string; file_name: string; size: number; created_at: string };

export async function uploadImage(file: File, alt = ""): Promise<CmsImage> {
  const body = new FormData();
  body.set("file", file);
  body.set("alt", alt);
  const res = await fetch("/api/admin/media", { method: "POST", body });
  const json = (await res.json().catch(() => ({}))) as { image?: CmsImage; error?: string };
  if (!res.ok || !json.image) throw new Error(json.error ?? `Upload failed (${res.status}).`);
  return json.image;
}

/** Choose an image from the library or upload a new one. */
export function MediaPicker({
  media,
  onPick,
  onClose,
  onUploaded,
}: {
  media: MediaAsset[];
  onPick: (image: CmsImage) => void;
  onClose: () => void;
  onUploaded: (asset: MediaAsset) => void;
}) {
  const [busy, setBusy] = useState<"" | "preparing" | "uploading">("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<{ text: string; image: CmsImage } | null>(null);
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const shown = media.filter((m) => !query || `${m.file_name} ${m.alt}`.toLowerCase().includes(query.toLowerCase()));

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy("preparing");
    setError("");
    setNotice(null);
    try {
      // Photos over the limit are resized and compressed here first; the server still checks the result.
      const prepared = await prepareImageForUpload(file);
      setBusy("uploading");
      const image = await uploadImage(prepared.file);
      onUploaded({ id: image.assetId!, url: image.src, width: image.width, height: image.height, alt: "", file_name: prepared.file.name, size: prepared.file.size, created_at: new Date().toISOString() });
      setQuery("");
      // An optimized photo stays in the picker, first in the grid, so the sizes can be read before using it.
      if (prepared.optimized) setNotice({ text: describeUpload(prepared), image });
      else onPick(image);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy("");
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Choose an image" className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4" onKeyDown={(e) => e.key === "Escape" && onClose()}>
      <div className="flex max-h-[90dvh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-center gap-3 border-b border-line p-4">
          <h2 className="text-lg font-semibold">Choose an image</h2>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="ml-auto h-10 w-48 rounded border border-line px-3 text-sm" />
          <button type="button" onClick={() => input.current?.click()} disabled={Boolean(busy)} className="inline-flex h-10 items-center gap-2 rounded bg-ink px-3 text-sm font-semibold text-white disabled:opacity-60">
            <Upload className="size-4" /> {busy === "preparing" ? "Optimizing…" : busy === "uploading" ? "Uploading…" : "Upload"}
          </button>
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
          <button type="button" onClick={onClose} aria-label="Close" className="inline-flex size-10 items-center justify-center rounded hover:bg-stone">
            <X className="size-5" />
          </button>
        </div>
        <p className="border-b border-line px-4 py-2 text-xs text-muted">
          JPEG, PNG, WebP, AVIF or GIF. Photos over {formatBytes(MAX_UPLOAD_BYTES)} are resized and compressed to fit before upload, keeping their shape and staying sharp at the sizes the site shows them.
        </p>
        {error && <p role="alert" className="border-b border-line bg-[#fff5f5] px-4 py-2 text-sm text-accent">{error}</p>}
        {notice && (
          <div role="status" className="flex flex-wrap items-center gap-3 border-b border-line bg-[#eef8f1] px-4 py-2 text-sm text-[#1f6b43]">
            <p className="min-w-0 flex-1">Uploaded. {notice.text}</p>
            <button type="button" onClick={() => onPick(notice.image)} className="rounded bg-[#1f6b43] px-3 py-1.5 font-semibold text-white">Use this image</button>
          </div>
        )}
        <div className="overflow-y-auto p-4">
          {shown.length === 0 ? (
            <p className="py-12 text-center text-muted">
              <ImagePlus className="mx-auto mb-2 size-8" /> No images yet. Upload one, or run the website import from the dashboard.
            </p>
          ) : (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
              {shown.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => onPick({ src: m.url, width: m.width, height: m.height, alt: m.alt, assetId: m.id })}
                    className="block w-full overflow-hidden rounded border border-line text-left hover:border-accent focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnails of arbitrary storage URLs */}
                    <img src={m.url} alt="" className="aspect-square w-full bg-stone object-contain" loading="lazy" />
                    <span className="block truncate px-2 py-1 text-xs text-muted">{m.file_name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
