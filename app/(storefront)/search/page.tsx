import Link from "next/link";
import { searchProducts } from "@/lib/queries/search";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import { SearchPageInput } from "@/components/storefront/SearchPageInput";

export const revalidate = 0;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const q = first(searchParams.q) ?? "";
  const page = Number(first(searchParams.page) ?? 1);
  const pageSize = 12;

  const result = q.trim() ? await searchProducts(q, { page, pageSize }) : { products: [], total: 0, page, pageSize };
  const totalPages = Math.max(1, Math.ceil(result.total / pageSize));

  return (
    <div className="mx-auto max-w-content px-6 py-10 md:px-16">
      <h1 className="mb-6 font-serif text-section text-ink">Search</h1>
      <SearchPageInput initialQuery={q} />

      {!q.trim() ? (
        <p className="text-body text-ink-muted">Enter a search term to find products.</p>
      ) : (
        <>
          <p className="mb-6 text-body text-ink-muted">
            {result.total} {result.total === 1 ? "result" : "results"} for &quot;{q}&quot;
          </p>

          {result.products.length === 0 ? (
            <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
              <p className="text-body-lg text-ink">No products found for &quot;{q}&quot;.</p>
              <Link href="/products" className="text-body text-accent underline underline-offset-4">
                Browse all products
              </Link>
            </div>
          ) : (
            <>
              <ProductGrid products={result.products} />

              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-3">
                  <Link
                    href={`/search?q=${encodeURIComponent(q)}&page=${page - 1}`}
                    aria-disabled={page <= 1}
                    className={`rounded border border-ink/15 px-5 py-2.5 text-body text-ink transition-colors hover:bg-ink/[0.03] ${
                      page <= 1 ? "pointer-events-none opacity-40" : ""
                    }`}
                  >
                    Previous
                  </Link>
                  <span className="text-body text-ink-muted">
                    Page {page} of {totalPages}
                  </span>
                  <Link
                    href={`/search?q=${encodeURIComponent(q)}&page=${page + 1}`}
                    aria-disabled={page >= totalPages}
                    className={`rounded border border-ink/15 px-5 py-2.5 text-body text-ink transition-colors hover:bg-ink/[0.03] ${
                      page >= totalPages ? "pointer-events-none opacity-40" : ""
                    }`}
                  >
                    Next
                  </Link>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
