import Link from "next/link";
import { getFilteredProducts, getFilterOptions, type SortOption } from "@/lib/queries/products";
import { FiltersPanel } from "@/components/storefront/FiltersPanel";
import { SortDropdown } from "@/components/storefront/SortDropdown";
import { ActiveFilterChips } from "@/components/storefront/ActiveFilterChips";
import { LoadMoreProducts } from "@/components/storefront/LoadMoreProducts";
import { PageBanner } from "@/components/storefront/PageBanner";

export const revalidate = 0;

const VALID_SORTS: SortOption[] = [
  "newest",
  "price-asc",
  "price-desc",
  "best-selling",
  "rating",
];

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const category = first(searchParams.category);
  const minPrice = first(searchParams.minPrice);
  const maxPrice = first(searchParams.maxPrice);
  const colors = first(searchParams.colors)?.split(",").filter(Boolean);
  const sizes = first(searchParams.sizes)?.split(",").filter(Boolean);
  const minRating = first(searchParams.minRating);
  const inStock = first(searchParams.inStock);
  const sortParam = first(searchParams.sort);
  const sort = VALID_SORTS.includes(sortParam as SortOption)
    ? (sortParam as SortOption)
    : "newest";

  const filters = {
    category,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    colors,
    sizes,
    minRating: minRating ? Number(minRating) : undefined,
    inStockOnly: inStock === "1",
    sort,
    page: 1,
    pageSize: 12,
  };

  const [filterOptions, result] = await Promise.all([
    getFilterOptions(),
    getFilteredProducts(filters),
  ]);

  const queryParams = new URLSearchParams();
  if (category) queryParams.set("category", category);
  if (minPrice) queryParams.set("minPrice", minPrice);
  if (maxPrice) queryParams.set("maxPrice", maxPrice);
  if (colors?.length) queryParams.set("colors", colors.join(","));
  if (sizes?.length) queryParams.set("sizes", sizes.join(","));
  if (minRating) queryParams.set("minRating", minRating);
  if (inStock) queryParams.set("inStock", inStock);
  if (sort !== "newest") queryParams.set("sort", sort);

  const activeCategory = category ? filterOptions.categories.find((c) => c.slug === category) : undefined;
  const categoryName = activeCategory?.name;

  return (
    <div>
      <PageBanner
        title={categoryName ?? "All Products"}
        breadcrumbLabel={categoryName ?? "Shop"}
        description={activeCategory?.description ?? undefined}
      />

      <div className="mx-auto max-w-content px-6 py-10 md:px-16">
      <div className="flex flex-col gap-10 md:flex-row">
        <FiltersPanel filterOptions={filterOptions} />

        <div className="flex-1">
          <div className="mb-2 flex items-center justify-between border-b border-ink/[0.08] pb-4">
            <p className="text-caption uppercase tracking-[0.12em] text-ink-muted">
              {result.total} {result.total === 1 ? "Item" : "Items"}
            </p>
            <SortDropdown />
          </div>

          <ActiveFilterChips filterOptions={filterOptions} />

          {result.products.length === 0 ? (
            <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
              <p className="text-body-lg text-ink">No products match these filters.</p>
              <Link href="/products" className="text-body text-accent underline underline-offset-4">
                Clear all filters
              </Link>
            </div>
          ) : (
            <LoadMoreProducts
              initialProducts={result.products}
              initialHasMore={result.hasMore}
              queryString={queryParams.toString()}
            />
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
