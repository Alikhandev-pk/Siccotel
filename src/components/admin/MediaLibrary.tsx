"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Trash2, Upload } from "lucide-react";
import { deleteMedia, updateMediaAlt, type ActionResult } from "@/app/admin/actions";
import { runImport } from "@/app/admin/import-action";
import { uploadImage, type MediaAsset } from "./MediaPicker";

export function MediaLibrary({ media }: { media: MediaAsset[] }) {
  const [items, setItems] = useState(media);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [, start] = useTransition();
  const input = useRef<HTMLInputElement>(null);
  const uploadButton = useRef<HTMLButtonElement>(null);
  const [highlight, setHighlight] = useState(false);

  // Arriving from the dashboard's "Upload media" shortcut: point at the upload button.
  // Browsers open a file picker only from a click, so it cannot open by itself.
  useEffect(() => {
    if (new URLSearchParams(location.search).get("upload") !== "1") return;
    uploadButton.current?.focus();
    const on = setTimeout(() => setHighlight(true), 0);
    const off = setTimeout(() => setHighlight(false), 4000);
    return () => { clearTimeout(on); clearTimeout(off); };
  }, []);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setResult(null);
    try {
      for (const file of Array.from(files)) {
        const img = await uploadImage(file);
        setItems((m) => [{ id: img.assetId!, url: img.src, width: img.width, height: img.height, alt: "", file_name: file.name, size: file.size, created_at: new Date().toISOString() }, ...m]);
      }
      setResult({ ok: true, message: "Uploaded." });
    } catch (e) {
      setResult({ ok: false, error: e instanceof Error ? e.message : "Upload failed." });
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          ref={uploadButton}
          type="button"
          disabled={busy}
          onClick={() => { setHighlight(false); input.current?.click(); }}
          className={`inline-flex h-10 items-center gap-2 rounded bg-accent px-4 text-sm font-semibold text-white transition-shadow hover:bg-accent-hover disabled:opacity-60 ${highlight ? "ring-4 ring-[#ff5c5c]/40 ring-offset-2 ring-offset-[#0b0c0e]" : ""}`}
        >
          <Upload className="size-4" /> {busy ? "Uploading…" : "Upload images"}
        </button>
        <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif,image/gif" className="hidden" onChange={(e) => onFiles(e.target.files)} />
        <p className="text-sm text-muted">JPEG, PNG, WebP, AVIF or GIF, up to 8 MB. Files in use cannot be deleted.</p>
      </div>
      {result && <p role="status" className={`rounded px-3 py-2 text-sm ${result.ok ? "bg-[#eef8f1] text-[#1f6b43]" : "bg-[#fff5f5] text-accent"}`}>{result.ok ? result.message : result.error}</p>}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((m) => (
          <li key={m.id} className="overflow-hidden rounded-md border border-line bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element -- library thumbnails */}
            <img src={m.url} alt={m.alt} className="aspect-[4/3] w-full bg-stone object-contain" loading="lazy" />
            <div className="space-y-2 p-3 text-sm">
              <p className="truncate font-semibold" title={m.file_name}>{m.file_name}</p>
              <p className="text-xs text-muted">{m.width} × {m.height} · {(m.size / 1024).toFixed(0)} KB</p>
              <input
                defaultValue={m.alt}
                placeholder="Default alt text"
                onBlur={(e) => e.target.value !== m.alt && start(async () => setResult(await updateMediaAlt(m.id, e.target.value)))}
                className="w-full rounded border border-line px-2 py-1"
              />
              <div className="flex gap-1">
                <button type="button" onClick={() => navigator.clipboard.writeText(m.url)} className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs hover:bg-stone"><Copy className="size-3.5" /> Copy URL</button>
                <button
                  type="button"
                  onClick={() => confirm("Delete this image?") && start(async () => {
                    const r = await deleteMedia(m.id);
                    setResult(r);
                    if (r.ok) setItems((all) => all.filter((x) => x.id !== m.id));
                  })}
                  className="ml-auto inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-accent hover:bg-stone"
                >
                  <Trash2 className="size-3.5" /> Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {items.length === 0 && <p className="text-muted">No images yet.</p>}
    </div>
  );
}

export function ImportButton({ seeded }: { seeded: boolean }) {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => { const r = await runImport(); setResult(r); router.refresh(); })}
        className="inline-flex h-10 items-center rounded bg-accent px-4 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Importing… (this can take a minute)" : seeded ? "Re-run import (adds only missing items)" : "Import the current website"}
      </button>
      {result && <p role="status" className={`text-sm ${result.ok ? "text-[#1f6b43]" : "text-accent"}`}>{result.ok ? result.message : result.error}</p>}
    </div>
  );
}
