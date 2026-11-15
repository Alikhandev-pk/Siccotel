import { adminMedia } from "@/components/admin/data";
import { isAdminRequest } from "@/lib/cms/auth";
import { MediaLibrary } from "@/components/admin/MediaLibrary";

export const metadata = { title: "Media library" };

export default async function MediaPage() {
  if (!(await isAdminRequest())) return null;
  const media = await adminMedia();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-semibold">Media library</h1>
        <p className="mt-1 text-ink-soft">Upload images once and reuse them in banners, products, logos, news and page photos.</p>
      </div>
      <MediaLibrary media={media} />
    </div>
  );
}
