"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, ExternalLink, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  createEntry,
  deleteEntry,
  discardDocDraft,
  publishDoc,
  publishEntry,
  reorderEntries,
  saveDocDraft,
  saveEntryDraft,
  unpublishEntry,
  type ActionResult,
} from "@/app/admin/actions";
import type { Field } from "@/lib/cms/schemas";
import type { CmsImage, CollectionName } from "@/lib/cms/types";
import { Fields } from "./SchemaForm";
import type { MediaAsset } from "./MediaPicker";

type Value = Record<string, unknown>;

function Status({ result }: { result: ActionResult | null }) {
  if (!result) return null;
  return (
    <p role="status" className={`rounded px-3 py-2 text-sm ${result.ok ? "bg-[#eef8f1] text-[#1f6b43]" : "bg-[#fff5f5] text-accent"}`}>
      {result.ok ? result.message : result.error}
    </p>
  );
}

const btn = "inline-flex h-10 items-center justify-center gap-2 rounded px-4 text-sm font-semibold disabled:opacity-50";

/** A page or settings document with draft and publish controls. */
export function DocEditor({ docKey, fields, initial, hasDraftChanges, publishedAt, publicPath, media: initialMedia }: {
  docKey: string;
  fields: Field[];
  initial: Value;
  hasDraftChanges: boolean;
  publishedAt: string | null;
  publicPath: string;
  media: MediaAsset[];
}) {
  const [value, setValue] = useState(initial);
  const [media, setMedia] = useState(initialMedia);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [dirty, setDirty] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  const act = (fn: () => Promise<ActionResult>) => start(async () => {
    const r = await fn();
    setResult(r);
    if (r.ok) { setDirty(false); router.refresh(); }
  });

  return (
    <div className="space-y-5">
      <div className="sticky top-0 z-10 -mx-4 flex flex-wrap items-center gap-2 border-b border-line bg-[#f6f6f4]/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        <span className="mr-auto text-sm text-muted">
          {dirty ? "Unsaved changes" : hasDraftChanges ? "Draft differs from the live page" : "Live page matches this version"}
          {publishedAt && ` · last published ${new Date(publishedAt).toLocaleString()}`}
        </span>
        <a href={publicPath} target="_blank" rel="noreferrer" className={`${btn} border border-ink/15 bg-white`}><ExternalLink className="size-4" /> View live</a>
        <button type="button" disabled={pending} onClick={() => act(() => saveDocDraft(docKey, value))} className={`${btn} border border-ink/15 bg-white`}>Save draft</button>
        {hasDraftChanges && !dirty && (
          <button type="button" disabled={pending} onClick={() => confirm("Discard the draft and return to the live version?") && act(async () => { const r = await discardDocDraft(docKey); if (r.ok) location.reload(); return r; })} className={`${btn} text-accent`}>Discard draft</button>
        )}
        <button type="button" disabled={pending} onClick={() => act(() => publishDoc(docKey, value))} className={`${btn} bg-accent text-white`}>{pending ? "Working…" : "Publish"}</button>
      </div>
      <Status result={result} />
      <div className="space-y-5">
        <Fields fields={fields} value={value} onChange={(v) => { setValue(v); setDirty(true); }} media={media} setMedia={setMedia} />
      </div>
    </div>
  );
}

/** A banner, product or article with draft, publish, unpublish and delete controls. */
export function EntryEditor({ collection, id, slug: initialSlug, fields, initial, isPublished, hasDraftChanges, media: initialMedia, publicPath }: {
  collection: CollectionName;
  id: string;
  slug: string;
  fields: Field[];
  initial: Value;
  isPublished: boolean;
  hasDraftChanges: boolean;
  media: MediaAsset[];
  publicPath: string;
}) {
  const [value, setValue] = useState(initial);
  const [slug, setSlug] = useState(initialSlug);
  const [media, setMedia] = useState(initialMedia);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const act = (fn: () => Promise<ActionResult>) => start(async () => {
    const r = await fn();
    setResult(r);
    if (r.ok) router.refresh();
  });
  // On success, leave the deleted item's page for the list (replace, so Back does not
  // return to it). On failure, stay here with the error shown.
  const remove = () => start(async () => {
    const r = await deleteEntry(id);
    if (r.ok) router.replace(`/admin/${collection}`);
    else setResult(r);
  });
  const valid = collection !== "banners" || Boolean((value.desktop as CmsImage | null)?.src);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-5">
        <div className="sticky top-0 z-10 -mx-4 flex flex-wrap items-center gap-2 border-b border-line bg-[#f6f6f4]/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
          <span className={`mr-auto rounded-full px-2.5 py-1 text-xs font-semibold ${isPublished ? "bg-[#eef8f1] text-[#1f6b43]" : "bg-stone text-muted"}`}>
            {isPublished ? (hasDraftChanges ? "Published · draft changes" : "Published") : "Not published"}
          </span>
          <button type="button" disabled={pending} onClick={() => act(() => saveEntryDraft(id, value, slug))} className={`${btn} border border-ink/15 bg-white`}>Save draft</button>
          {collection === "news" && (
            <a href={`/preview/news/${id}`} target="_blank" rel="noreferrer" title="Shows the last saved draft" className={`${btn} border border-ink/15 bg-white`}>
              Preview draft
            </a>
          )}
          {isPublished && <button type="button" disabled={pending} onClick={() => act(() => unpublishEntry(id))} className={`${btn} border border-ink/15 bg-white`}>Unpublish</button>}
          <button type="button" disabled={pending || !valid} onClick={() => act(() => publishEntry(id, value, slug))} className={`${btn} bg-accent text-white`} title={valid ? undefined : "Choose a desktop image first"}>Publish</button>
          <button type="button" disabled={pending} onClick={() => confirm("Delete permanently from the site?") && remove()} className={`${btn} text-accent`}>Delete</button>
        </div>
        <Status result={result} />
        {collection !== "banners" && (
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">URL slug{collection === "news" && <span className="block text-xs font-normal text-muted">The article address: /news/{slug || "…"}</span>}</span>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full rounded border border-line-strong bg-white px-3 py-2" />
          </label>
        )}
        <Fields fields={fields} value={value} onChange={setValue} media={media} setMedia={setMedia} />
      </div>
      <aside className="space-y-3 xl:sticky xl:top-20 xl:self-start">
        <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">Preview (current form)</h2>
        <Preview collection={collection} value={value} />
        {isPublished && (
          <a href={publicPath} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-accent">
            View live page <ExternalLink className="size-4" />
          </a>
        )}
      </aside>
    </div>
  );
}

/* eslint-disable @next/next/no-img-element -- previews of arbitrary storage URLs */
function Preview({ collection, value }: { collection: CollectionName; value: Value }) {
  if (collection === "banners") {
    const desktop = value.desktop as CmsImage | null;
    const mobile = (value.mobile as CmsImage | null) ?? desktop;
    return (
      <div className="space-y-3 rounded-md border border-line bg-white p-3">
        <p className="text-xs text-muted">Desktop</p>
        <div className="aspect-[4000/1435] overflow-hidden rounded" style={{ background: String(value.background || "#fff") }}>
          {desktop?.src && <img src={desktop.src} alt={desktop.alt} className="size-full object-contain" />}
        </div>
        <p className="text-xs text-muted">Phone {value.mobile ? "" : "(uses the desktop image)"}</p>
        <div className="mx-auto w-40 overflow-hidden rounded border border-line" style={{ background: String(value.background || "#fff") }}>
          {mobile?.src && <img src={mobile.src} alt="" className="w-full object-contain" />}
        </div>
        <div className="border-t border-line pt-2">
          <p className="text-xs font-semibold tracking-[0.1em] text-accent uppercase">{String(value.brand || "")}</p>
          <p className="font-semibold">{String(value.title || "")}</p>
          {value.ctaLabel && value.ctaHref ? <p className="text-sm font-semibold text-accent">{String(value.ctaLabel)} ↗</p> : null}
        </div>
      </div>
    );
  }
  if (collection === "products") {
    const first = (value.images as CmsImage[] | undefined)?.[0];
    return (
      <div className="rounded-md border border-line bg-white p-3">
        <div className="overflow-hidden rounded border border-line bg-white">{first?.src ? <img src={first.src} alt={first.alt} className="aspect-square w-full object-contain" /> : <div className="aspect-square bg-stone" />}</div>
        <p className="mt-3 font-semibold">{String(value.name || "")}</p>
        <p className="text-sm text-muted">{[value.brand, value.category].filter(Boolean).join(" · ")}</p>
        {value.showOnAssembly ? <p className="mt-2 text-xs font-semibold text-[#1f6b43]">Shown on Assembly</p> : null}
      </div>
    );
  }
  const cover = value.cover as CmsImage | null;
  return (
    <div className="rounded-md border border-line bg-white p-3">
      <div className="aspect-[16/10] overflow-hidden rounded bg-stone">{cover?.src && <img src={cover.src} alt={cover.alt} className="size-full object-cover" />}</div>
      {value.context ? <p className="mt-3 text-xs font-semibold tracking-[0.12em] text-accent uppercase">{String(value.context)}</p> : null}
      <p className="mt-2 font-semibold">{String(value.title || "")}</p>
      <p className="mt-1 text-sm text-muted">{String(value.summary || "")}</p>
    </div>
  );
}
/* eslint-enable @next/next/no-img-element */

export type EntryRow = { id: string; slug: string; title: string; thumb: string; isPublished: boolean; hasDraftChanges: boolean };

/**
 * Collection list with ordering, delete and a create button.
 *
 * The rows always come from the server (`rows`). With Cache Components, Next keeps
 * visited routes alive in <Activity>, so state seeded from props (useState(rows))
 * survives navigation and would keep showing rows that were deleted elsewhere. Only
 * an unsaved reorder (a list of ids) and rows deleted here are held locally, and both
 * are applied on top of the current server rows.
 */
export function EntryList({ collection, rows, empty, singular }: { collection: CollectionName; rows: EntryRow[]; empty: Value; singular: string }) {
  const [orderIds, setOrderIds] = useState<string[] | null>(null);
  const [deleted, setDeleted] = useState<ReadonlySet<string>>(new Set());
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const live = rows.filter((r) => !deleted.has(r.id));
  const byId = new Map(live.map((r) => [r.id, r]));
  const order = orderIds
    ? [...orderIds.flatMap((id) => byId.get(id) ?? []), ...live.filter((r) => !orderIds.includes(r.id))]
    : live;
  const moved = order.map((r) => r.id).join() !== live.map((r) => r.id).join();
  const setOrder = (fn: (o: EntryRow[]) => EntryRow[]) => setOrderIds(fn(order).map((r) => r.id));
  // The row goes only after the server confirms the delete; on failure it stays, with the error.
  const remove = (row: EntryRow) => start(async () => {
    const r = await deleteEntry(row.id);
    setResult(r);
    if (r.ok) {
      setDeleted((d) => new Set(d).add(row.id));
      router.refresh();
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => start(async () => {
            const r = await createEntry(collection, empty, String(empty.title ?? empty.name ?? singular));
            if (r.ok && r.id) router.push(`/admin/${collection}/${r.id}`);
            else setResult(r);
          })}
          className={`${btn} bg-ink text-white`}
        >
          <Plus className="size-4" /> New {singular.toLowerCase()}
        </button>
        {moved && (
          <button type="button" disabled={pending} onClick={() => start(async () => { const r = await reorderEntries(collection, order.map((o) => o.id)); setResult(r); if (r.ok) setOrderIds(null); router.refresh(); })} className={`${btn} bg-accent text-white`}>
            Save order
          </button>
        )}
      </div>
      <Status result={result} />
      {order.length === 0 ? (
        <p className="rounded-md border border-dashed border-line-strong bg-white p-8 text-center text-muted">Nothing here yet.</p>
      ) : (
        <ol className="divide-y divide-line overflow-hidden rounded-md border border-line bg-white">
          {order.map((row, i) => (
            <li key={row.id} className="flex items-center gap-3 p-3">
              <span className="w-6 text-right text-sm text-muted tabular-nums">{i + 1}</span>
              {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
              {row.thumb ? <img src={row.thumb} alt="" className="h-12 w-20 rounded border border-line object-contain" /> : <span className="h-12 w-20 rounded bg-stone" />}
              <Link href={`/admin/${collection}/${row.id}`} className="min-w-0 flex-1 truncate font-semibold hover:text-accent">{row.title || "(untitled)"}</Link>
              <span className={`hidden rounded-full px-2.5 py-1 text-xs font-semibold sm:inline ${row.isPublished ? "bg-[#eef8f1] text-[#1f6b43]" : "bg-stone text-muted"}`}>
                {row.isPublished ? (row.hasDraftChanges ? "Published · draft" : "Published") : "Draft"}
              </span>
              <button type="button" aria-label="Move up" className="inline-flex size-9 items-center justify-center rounded hover:bg-stone" onClick={() => setOrder((o) => { const n = [...o]; if (i > 0) [n[i - 1], n[i]] = [n[i], n[i - 1]]; return n; })}><ArrowUp className="size-4" /></button>
              <button type="button" aria-label="Move down" className="inline-flex size-9 items-center justify-center rounded hover:bg-stone" onClick={() => setOrder((o) => { const n = [...o]; if (i < n.length - 1) [n[i + 1], n[i]] = [n[i], n[i + 1]]; return n; })}><ArrowDown className="size-4" /></button>
              <button
                type="button"
                disabled={pending}
                aria-label={`Delete ${row.title || "this item"}`}
                data-delete={row.id}
                onClick={() => confirm(`Delete “${row.title || "this item"}”? It is removed from the site and from this list.`) && remove(row)}
                className="inline-flex h-9 items-center gap-1 rounded px-2 text-sm font-semibold text-accent hover:bg-stone disabled:opacity-50"
              >
                <Trash2 className="size-4" /> <span className="hidden sm:inline">Delete</span>
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
