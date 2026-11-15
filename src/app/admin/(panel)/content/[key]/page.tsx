import { notFound } from "next/navigation";
import { isAdminRequest } from "@/lib/cms/auth";
import { adminDoc, adminMedia } from "@/components/admin/data";
import { DocEditor } from "@/components/admin/Editors";
import { docSchemas } from "@/lib/cms/schemas";
import { DOC_KEYS, type DocKey, type HomeDoc } from "@/lib/cms/types";
import { resolveReachArtwork } from "@/lib/cms/artwork";

export const metadata = { title: "Edit page" };

/** Explains when the saved Nationwide Reach map shows without its markers or clickable regions. */
async function reachMapNotice(reach: HomeDoc["reach"]) {
  const artwork = await resolveReachArtwork(reach);
  if (!artwork.markers) return "Nationwide Reach: the city markers were measured on a different map image, so the homepage shows this map without them. Check the city positions against this image and save to place them on it.";
  if (!artwork.regions) return "Nationwide Reach: this map image has no traced region outlines, so its North, Central and South areas are not clickable. The markers and city list still work.";
  return null;
}

export default async function ContentPage({ params }: PageProps<"/admin/content/[key]">) {
  if (!(await isAdminRequest())) return null;
  const { key } = await params;
  if (!DOC_KEYS.includes(key as DocKey)) notFound();
  const schema = docSchemas[key as DocKey];
  const [doc, media] = await Promise.all([adminDoc(key as DocKey), adminMedia()]);
  const reachNotice = key === "home" ? await reachMapNotice(doc.value.reach as HomeDoc["reach"]) : null;
  return (
    <div className="max-w-4xl space-y-4">
      <div>
        <h1 className="text-3xl font-semibold">{schema.title}</h1>
        <p className="mt-1 text-ink-soft">{schema.description}</p>
        {!doc.exists && <p className="mt-3 rounded bg-[#fff8e6] px-3 py-2 text-sm">Not imported yet: this shows the site’s built-in content. Publishing saves it to the CMS.</p>}
        {reachNotice && <p className="mt-3 rounded bg-[#fff8e6] px-3 py-2 text-sm">{reachNotice}</p>}
      </div>
      <DocEditor
        key={key}
        docKey={key}
        fields={schema.fields}
        initial={doc.value}
        hasDraftChanges={doc.hasDraftChanges}
        publishedAt={doc.publishedAt}
        publicPath={schema.path}
        media={media}
      />
    </div>
  );
}
