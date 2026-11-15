"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { ExternalLink, Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { createEntry, deleteEntry, publishSavedDraft, unpublishEntry, type ActionResult } from "@/app/admin/actions";
import type { NewsRow } from "./data";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "drafts", label: "Drafts" },
  { id: "published", label: "Published" },
] as const;

const STATUS: Record<NewsRow["status"], { label: string; cls: string }> = {
  published: { label: "Published", cls: "bg-[#eef8f1] text-[#1f6b43]" },
  changed: { label: "Published · unpublished changes", cls: "bg-[#fff8e6]" },
  draft: { label: "Draft", cls: "bg-stone text-muted" },
  unpublished: { label: "Unpublished", cls: "bg-stone text-muted" },
};

const btn = "inline-flex h-9 items-center gap-1.5 rounded px-3 text-sm font-semibold disabled:opacity-50";

export function NewsList({ rows, empty }: { rows: NewsRow[]; empty: Record<string, unknown> }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^#/, "");
    return rows.filter((r) => {
      if (filter === "published" && !(r.status === "published" || r.status === "changed")) return false;
      if (filter === "drafts" && !(r.status === "draft" || r.status === "unpublished" || r.status === "changed")) return false;
      if (!q) return true;
      return [r.title, r.slug, r.summary, ...r.tags].some((s) => s.toLowerCase().includes(q));
    });
  }, [rows, filter, query]);

  const act = (fn: () => Promise<ActionResult>) =>
    start(async () => {
      const r = await fn();
      setResult(r);
      router.refresh();
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await createEntry("news", empty, "New article");
              if (r.ok && r.id) router.push(`/admin/news/${r.id}`);
              else setResult(r);
            })
          }
          className={`${btn} h-10 bg-ink px-4 text-white`}
        >
          <Plus className="size-4" /> New article
        </button>
        <div role="tablist" aria-label="Filter articles" className="inline-flex rounded border border-line-strong p-0.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              role="tab"
              type="button"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`h-9 rounded px-3 text-sm font-semibold ${filter === f.id ? "bg-accent text-white" : "text-muted hover:text-ink"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <label className="relative ml-auto block w-full sm:w-72">
          <span className="sr-only">Search articles by title or keyword</span>
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title or keyword"
            className="h-10 w-full rounded border border-line-strong bg-white pr-3 pl-9 text-sm"
          />
        </label>
      </div>
      {result && (
        <p role="status" className={`rounded px-3 py-2 text-sm ${result.ok ? "bg-[#eef8f1] text-[#1f6b43]" : "bg-[#fff5f5] text-accent"}`}>
          {result.ok ? result.message : result.error}
        </p>
      )}
      <p className="text-sm text-muted">
        {shown.length} of {rows.length} articles
      </p>
      {shown.length === 0 ? (
        <p className="rounded-md border border-dashed border-line-strong bg-white p-8 text-center text-muted">No articles match.</p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-md border border-line bg-white" aria-label="Articles">
          {shown.map((row) => {
            const live = row.status === "published" || row.status === "changed";
            return (
              <li key={row.id} data-article-row={row.slug} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {row.thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail, shown with the article's crop
                    <img src={row.thumb} alt="" className="h-12 w-[4.8rem] shrink-0 rounded border border-line object-cover" style={{ objectPosition: row.coverPosition }} />
                  ) : (
                    <span className="h-12 w-[4.8rem] shrink-0 rounded bg-stone" />
                  )}
                  <div className="min-w-0">
                    <Link href={`/admin/news/${row.id}`} className="block truncate font-semibold hover:text-accent">
                      {row.title || "(untitled)"}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS[row.status].cls}`}>{STATUS[row.status].label}</span>
                      {row.tags.map((t) => (
                        <button key={t} type="button" onClick={() => setQuery(t)} className="rounded-full border border-line px-2 py-0.5 text-xs text-muted hover:text-ink" title={`Show articles tagged ${t}`}>
                          #{t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Link href={`/admin/news/${row.id}`} className={`${btn} border border-ink/15`}>
                    <Pencil className="size-3.5" /> Edit
                  </Link>
                  <a href={`/preview/news/${row.id}`} target="_blank" rel="noreferrer" className={`${btn} border border-ink/15`}>
                    <Eye className="size-3.5" /> Preview
                  </a>
                  {live && (
                    <a href={`/news/${row.liveSlug}`} target="_blank" rel="noreferrer" className={`${btn} border border-ink/15`}>
                      <ExternalLink className="size-3.5" /> Live
                    </a>
                  )}
                  {row.status !== "published" && (
                    <button type="button" disabled={pending} onClick={() => act(() => publishSavedDraft(row.id))} className={`${btn} bg-accent text-white`}>
                      Publish
                    </button>
                  )}
                  {live && (
                    <button type="button" disabled={pending} onClick={() => act(() => unpublishEntry(row.id))} className={`${btn} border border-ink/15`}>
                      Unpublish
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => confirm(`Delete “${row.title}”? It is removed from the site and from this list.`) && act(() => deleteEntry(row.id))}
                    className={`${btn} text-accent`}
                  >
                    <Trash2 className="size-3.5" /> Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
