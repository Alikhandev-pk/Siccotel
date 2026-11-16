import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { getDoc, getProducts } from "@/lib/cms/public";
import { Reveal } from "@/components/ui";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Products",
  description: "Devices available through Siccotel, including mobile phones assembled by Siccotel Telecom in Karachi.",
  path: "/products",
});

export default async function ProductsPage() {
  const [doc, products] = await Promise.all([getDoc("productsPage"), getProducts()]);
  // Every published product is listed, devices assembled in Karachi first.
  const ordered = [...products.filter((p) => p.assembled === true), ...products.filter((p) => p.assembled !== true)];
  return (
    <section aria-labelledby="products-title" className="section-space">
      <div className="container-site">
        <h1 id="products-title" className="t-h1">
          {doc.title || "Products"}
        </h1>
        <ProductGrid products={ordered} />
      </div>
    </section>
  );
}

type ProductCard = Awaited<ReturnType<typeof getProducts>>[number];

/** Product cards in a fixed square frame, so portrait or landscape uploads keep the grid even. */
function ProductGrid({ products }: { products: ProductCard[] }) {
  if (!products.length) return <p className="mt-6 text-muted">Products will be listed here soon.</p>;
  return (
    <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-6 sm:mt-10 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-8 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((p, i) => (
        <Reveal as="li" key={p.id} delay={(i % 5) * 60}>
          <div className="relative aspect-square overflow-hidden rounded-[4px] border border-line bg-white">
            {p.images[0]?.src ? (
              <Image
                src={p.images[0].src}
                alt={p.images[0].alt || p.name}
                fill
                sizes="(min-width: 1280px) 230px, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-contain"
              />
            ) : (
              <div className="size-full bg-stone" />
            )}
          </div>
          <p className="mt-3 font-semibold">{p.name}</p>
          {(p.brand || p.category) && <p className="text-sm text-muted">{[p.brand.trim(), p.category.trim()].filter(Boolean).join(" · ")}</p>}
          {p.storeUrl && (
            <a href={p.storeUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-accent sm:min-h-0">
              View on Sicco Store <ArrowUpRight aria-hidden className="size-3.5" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
        </Reveal>
      ))}
    </ul>
  );
}
