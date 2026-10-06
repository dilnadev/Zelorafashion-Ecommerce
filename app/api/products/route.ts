import { NextResponse, type NextRequest } from "next/server";
import { getFilteredProducts, type SortOption } from "@/lib/queries/products";

const VALID_SORTS: SortOption[] = [
  "newest",
  "price-asc",
  "price-desc",
  "best-selling",
  "rating",
];

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const sortParam = params.get("sort");
  const sort = VALID_SORTS.includes(sortParam as SortOption)
    ? (sortParam as SortOption)
    : "newest";

  const result = await getFilteredProducts({
    category: params.get("category") ?? undefined,
    minPrice: params.get("minPrice") ? Number(params.get("minPrice")) : undefined,
    maxPrice: params.get("maxPrice") ? Number(params.get("maxPrice")) : undefined,
    colors: params.get("colors")?.split(",").filter(Boolean),
    sizes: params.get("sizes")?.split(",").filter(Boolean),
    minRating: params.get("minRating") ? Number(params.get("minRating")) : undefined,
    inStockOnly: params.get("inStock") === "1",
    sort,
    page: params.get("page") ? Number(params.get("page")) : 1,
    pageSize: params.get("pageSize") ? Number(params.get("pageSize")) : 12,
  });

  return NextResponse.json(result);
}
