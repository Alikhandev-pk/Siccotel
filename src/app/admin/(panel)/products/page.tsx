import { CollectionList } from "@/components/admin/CollectionPages";
import { isAdminRequest } from "@/lib/cms/auth";

export const metadata = { title: "Products" };

export default async function Page() {
  if (!(await isAdminRequest())) return null;
  return <CollectionList collection="products" />;
}
