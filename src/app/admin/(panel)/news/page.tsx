import { adminNewsRows } from "@/components/admin/data";
import { NewsList } from "@/components/admin/NewsList";
import { isAdminRequest } from "@/lib/cms/auth";
import { collectionSchemas } from "@/lib/cms/schemas";

export const metadata = { title: "News" };

export default async function NewsAdminPage() {
  if (!(await isAdminRequest())) return null;
  const rows = await adminNewsRows();
  return (
    <div className="max-w-5xl space-y-5">
      <div>
        <h1 className="text-3xl font-semibold">News articles</h1>
        <p className="mt-1 text-ink-soft">{collectionSchemas.news.description}</p>
      </div>
      <NewsList rows={rows} empty={collectionSchemas.news.empty} />
    </div>
  );
}
