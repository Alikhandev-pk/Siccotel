import { CollectionEdit } from "@/components/admin/CollectionPages";
import { isAdminRequest } from "@/lib/cms/auth";

export const metadata = { title: "Edit" };

export default async function Page({ params }: PageProps<"/admin/products/[id]">) {
  if (!(await isAdminRequest())) return null;
  const { id } = await params;
  return <CollectionEdit collection="products" id={id} />;
}
