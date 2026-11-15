import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { collectionSchemas } from "@/lib/cms/schemas";
import type { CollectionName } from "@/lib/cms/types";
import { adminEntries, adminEntry, adminMedia } from "./data";
import { EntryEditor, EntryList } from "./Editors";

export async function CollectionList({ collection }: { collection: CollectionName }) {
  const schema = collectionSchemas[collection];
  const rows = await adminEntries(collection, schema.titleKey);
  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <h1 className="text-3xl font-semibold">{schema.title}</h1>
        <p className="mt-1 text-ink-soft">{schema.description}</p>
      </div>
      <EntryList collection={collection} rows={rows} empty={schema.empty} singular={schema.singular} />
    </div>
  );
}

const publicPathFor = (collection: CollectionName, slug: string) => (collection === "banners" ? "/" : collection === "products" ? "/products" : `/news/${slug}`);

export async function CollectionEdit({ collection, id }: { collection: CollectionName; id: string }) {
  const schema = collectionSchemas[collection];
  const [entry, media] = await Promise.all([adminEntry(collection, id), adminMedia()]);
  return (
    <div className="space-y-4">
      <Link href={`/admin/${collection}`} className="inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> {schema.title}
      </Link>
      <h1 className="text-2xl font-semibold">{String(entry.value[schema.titleKey] || `Untitled ${schema.singular.toLowerCase()}`)}</h1>
      <EntryEditor
        collection={collection}
        id={entry.id}
        slug={entry.slug}
        fields={schema.fields}
        initial={{ ...schema.empty, ...entry.value }}
        isPublished={entry.isPublished}
        hasDraftChanges={entry.hasDraftChanges}
        media={media}
        publicPath={publicPathFor(collection, entry.slug)}
      />
    </div>
  );
}
