import { getAdminProducts, type AdminProductSort } from "@/lib/queries/admin-products";
import { ProductsTable } from "@/components/admin/ProductsTable";

export const revalidate = 0;

const VALID_SORTS: AdminProductSort[] = ["created_at", "title", "price", "stock_quantity"];

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const page = Number(searchParams.page ?? 1);
  const search = typeof searchParams.search === "string" ? searchParams.search : "";
  const sortByParam = typeof searchParams.sortBy === "string" ? searchParams.sortBy : "created_at";
  const sortBy = VALID_SORTS.includes(sortByParam as AdminProductSort)
    ? (sortByParam as AdminProductSort)
    : "created_at";
  const sortDir = searchParams.sortDir === "asc" ? "asc" : "desc";

  const result = await getAdminProducts({ page, pageSize: 20, search, sortBy, sortDir });

  return (
    <div>
      <h1 className="mb-8 font-serif text-section text-ink">Products</h1>
      <ProductsTable
        products={result.products}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        search={search}
        sortBy={sortBy}
        sortDir={sortDir}
      />
    </div>
  );
}
