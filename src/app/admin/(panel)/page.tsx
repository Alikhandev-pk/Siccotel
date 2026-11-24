import Link from "next/link";
import { ArrowUpRight, ChevronRight, FilePlus2, Image as ImageIcon, Newspaper, Package, PenLine, Plus, SlidersHorizontal, Upload } from "lucide-react";
import { ImportButton } from "@/components/admin/ImportButton";
import { isAdminRequest, requireAdmin } from "@/lib/cms/auth";
import { SEED_MARKER_KEY } from "@/lib/cms/config";
import { fromSql, parseJson, select } from "@/lib/cms/db";
import type { CollectionName } from "@/lib/cms/types";
import { createAndOpen } from "../actions";

export const metadata = { title: "Dashboard" };

type EntryRow = { id: string; collection: CollectionName; draft: string; published: string | null; is_published: number; updated_at: string };
type Status = "published" | "changed" | "draft" | "unpublished";

const TYPE: Record<CollectionName, { label: string; plural: string; icon: typeof Package }> = {
  products: { label: "Product", plural: "Products", icon: Package },
  banners: { label: "Banner", plural: "Banners", icon: SlidersHorizontal },
  news: { label: "News article", plural: "News articles", icon: Newspaper },
};

const STATUS: Record<Status, { label: string; cls: string }> = {
  published: { label: "Published", cls: "bg-[#0f2a1c] text-[#6fdc9f]" },
  changed: { label: "Unpublished changes", cls: "bg-[#2e2410] text-[#f5d48a]" },
  draft: { label: "Draft", cls: "bg-stone-2 text-ink-soft" },
  unpublished: { label: "Unpublished", cls: "bg-stone-2 text-muted" },
};

const statusOf = (e: EntryRow): Status => (e.is_published ? (e.draft !== e.published ? "changed" : "published") : e.published ? "unpublished" : "draft");

const KARACHI: Intl.DateTimeFormatOptions = { timeZone: "Asia/Karachi", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" };
const fullTime = (d: Date) => d.toLocaleString("en-GB", KARACHI);

/** "5 min ago"; this page renders per request, so the server clock is current. */
function relativeTime(d: Date) {
  const s = Math.max(0, Math.round((Date.now() - d.getTime()) / 1000));
  if (s < 60) return "Just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr${h === 1 ? "" : "s"} ago`;
  const days = Math.round(h / 24);
  if (days < 7) return days === 1 ? "Yesterday" : `${days} days ago`;
  return d.toLocaleDateString("en-GB", { timeZone: "Asia/Karachi", day: "numeric", month: "short", year: "numeric" });
}

function titleOf(e: EntryRow) {
  const v = parseJson<Record<string, unknown>>(e.draft) ?? {};
  return String(v.title || v.name || "").trim() || `Untitled ${TYPE[e.collection].label.toLowerCase()}`;
}

const card = "group flex h-full flex-col rounded-lg border border-line bg-white p-5 transition-colors hover:border-line-strong";
const primary = "flex h-12 w-full items-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-hover";

export default async function Dashboard() {
  if (!(await isAdminRequest())) return null;
  await requireAdmin();
  const [entries, mediaRows, seedRows] = await Promise.all([
    select<EntryRow>("SELECT id, collection, draft, published, is_published, updated_at FROM entries WHERE deleted_at IS NULL ORDER BY updated_at DESC, id"),
    select<{ total: number; recent: number | null }>("SELECT COUNT(*) AS total, SUM(created_at > UTC_TIMESTAMP() - INTERVAL 7 DAY) AS recent FROM media_assets"),
    select<{ key: string }>("SELECT `key` FROM documents WHERE `key` = ?", [SEED_MARKER_KEY]),
  ]);
  // Until the first import, public pages show the built-in content and ignore the database.
  const imported = seedRows.length > 0;

  const stats = (c: CollectionName) => {
    const rows = entries.filter((e) => e.collection === c);
    return {
      published: rows.filter((e) => e.is_published).length,
      drafts: rows.filter((e) => !e.is_published).length,
      pending: rows.filter((e) => e.is_published && e.draft !== e.published).length,
    };
  };
  const media = { total: Number(mediaRows[0]?.total ?? 0), recent: Number(mediaRows[0]?.recent ?? 0) };
  const recent = entries.slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Website overview</h1>
          <p className="mt-1 text-ink-soft">What is live on the website, what is waiting to be published, and shortcuts to common tasks.</p>
        </div>
        <a href="/" target="_blank" rel="noopener" className="inline-flex h-10 items-center gap-2 rounded-md border border-line-strong px-4 text-sm font-semibold hover:border-ink-soft">
          View website <ArrowUpRight className="size-4" />
        </a>
      </header>

      {!imported && (
        <section aria-labelledby="setup-heading" className="rounded-lg border border-accent/40 bg-white p-5">
          <h2 id="setup-heading" className="text-lg font-semibold">Finish setup: import the website</h2>
          <p className="mt-1 mb-4 max-w-2xl text-sm text-ink-soft">
            The public site is still showing its built-in content. Importing copies every page, banner, product and article, with their images, into this database. From then on, what you publish here is what the site shows.
          </p>
          <ImportButton />
        </section>
      )}

      <section aria-label="Overview">
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(["products", "banners", "news"] as const).map((c) => {
            const s = stats(c);
            const Icon = TYPE[c].icon;
            return (
              <li key={c} data-card={c}>
                <Link href={`/admin/${c}`} className={card}>
                  <span className="flex items-center justify-between text-sm font-medium text-ink-soft">
                    <span className="flex items-center gap-2"><Icon className="size-4 text-muted" /> {TYPE[c].plural}</span>
                    <ChevronRight className="size-4 text-muted transition-transform group-hover:translate-x-0.5" />
                  </span>
                  <span className="mt-4 mb-4 flex items-baseline gap-2">
                    <span className="text-4xl font-semibold tracking-tight tabular-nums" data-stat="published">{s.published}</span>
                    <span className="text-sm text-muted">published</span>
                  </span>
                  <span className="mt-auto flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-3 text-sm text-ink-soft">
                    <span><span className="font-semibold tabular-nums" data-stat="drafts">{s.drafts}</span> {s.drafts === 1 ? "draft" : "drafts"}</span>
                    <span className={s.pending ? "text-[#f5d48a]" : ""}>
                      <span className="font-semibold tabular-nums" data-stat="pending">{s.pending}</span> pending {s.pending === 1 ? "change" : "changes"}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
          <li data-card="media">
            <Link href="/admin/media" className={card}>
              <span className="flex items-center justify-between text-sm font-medium text-ink-soft">
                <span className="flex items-center gap-2"><ImageIcon className="size-4 text-muted" /> Media</span>
                <ChevronRight className="size-4 text-muted transition-transform group-hover:translate-x-0.5" />
              </span>
              <span className="mt-4 mb-4 flex items-baseline gap-2">
                <span className="text-4xl font-semibold tracking-tight tabular-nums" data-stat="media">{media.total}</span>
                <span className="text-sm text-muted">{media.total === 1 ? "image" : "images"}</span>
              </span>
              <span className="mt-auto border-t border-line pt-3 text-sm text-ink-soft">
                <span className="font-semibold tabular-nums">{media.recent}</span> added in the last 7 days
              </span>
            </Link>
          </li>
        </ul>
      </section>

      <section aria-labelledby="actions-heading">
        <h2 id="actions-heading" className="text-xs font-semibold tracking-[0.12em] text-muted uppercase">Quick actions</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {([
            { c: "products", label: "Add product", icon: Plus },
            { c: "banners", label: "Create banner", icon: FilePlus2 },
            { c: "news", label: "Write article", icon: PenLine },
          ] as const).map(({ c, label, icon: Icon }) => (
            <form key={c} action={createAndOpen}>
              <input type="hidden" name="collection" value={c} />
              <button className={primary}><Icon className="size-4" /> {label}</button>
            </form>
          ))}
          <Link href="/admin/media?upload=1" className={primary}><Upload className="size-4" /> Upload media</Link>
        </div>
      </section>

      <section aria-labelledby="recent-heading" className="rounded-lg border border-line bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-4">
          <h2 id="recent-heading" className="text-lg font-semibold">Recently updated</h2>
          <span className="text-xs text-muted">Products, banners and news articles</span>
        </div>
        {recent.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="font-semibold">Nothing here yet</p>
            <p className="mt-1 text-sm text-muted">Products, banners and news articles you create or edit will appear here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-line" data-recent>
            {recent.map((e) => {
              const status = STATUS[statusOf(e)];
              const updated = fromSql(e.updated_at);
              return (
                <li key={e.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5 sm:flex-nowrap">
                  <div className="min-w-0 basis-full sm:flex-1 sm:basis-auto">
                    <p className="truncate font-semibold">{titleOf(e)}</p>
                    <p className="text-xs text-muted">{TYPE[e.collection].label}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${status.cls}`}>{status.label}</span>
                  {updated && (
                    <time dateTime={updated.toISOString()} title={fullTime(updated)} className="text-sm whitespace-nowrap text-muted sm:w-28 sm:text-right">
                      {relativeTime(updated)}
                    </time>
                  )}
                  <Link href={`/admin/${e.collection}/${e.id}`} className="ml-auto rounded-md border border-line-strong px-3 py-1.5 text-sm font-semibold hover:border-ink-soft sm:ml-0">
                    Edit
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
