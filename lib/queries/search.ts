import { createClient } from "@/lib/supabase/server";
import { attachImages } from "@/lib/queries/shared";
import type { ProductCardData } from "@/components/storefront/ProductCard";

// PostgREST's .or() builds its filter from a comma-separated string, so a
// raw comma/parenthesis in user input could inject extra filter clauses.
// Neither character is meaningful in a product search, so just strip them.
function sanitizeForOrFilter(query: string): string {
  return query.replace(/[,()]/g, " ").trim();
}

export interface QuickSearchResult {
  id: string;
  slug: string;
  title: string;
  price: number;
  sale_price: number | null;
  image: string | null;
}

export async function searchProductsQuick(query: string, limit = 6): Promise<QuickSearchResult[]> {
  const q = sanitizeForOrFilter(query);
  if (!q) return [];

  const supabase = createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, slug, title, price, sale_price")
    .eq("status", "active")
    .ilike("title", `%${q}%`)
    .order("created_at", { ascending: false })
    .limit(limit);

  const rows = products ?? [];
  if (rows.length === 0) return [];

  const { data: images } = await supabase
    .from("product_images")
    .select("product_id, image_url, sort_order")
    .in(
      "product_id",
      rows.map((p) => p.id)
    )
    .order("sort_order");

  const firstImageByProduct = new Map<string, string>();
  for (const img of images ?? []) {
    if (!firstImageByProduct.has(img.product_id)) firstImageByProduct.set(img.product_id, img.image_url);
  }

  return rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    price: p.price,
    sale_price: p.sale_price,
    image: firstImageByProduct.get(p.id) ?? null,
  }));
}

export interface SearchResult {
  products: ProductCardData[];
  total: number;
  page: number;
  pageSize: number;
}

export async function searchProducts(
  query: string,
  { page = 1, pageSize = 12 }: { page?: number; pageSize?: number } = {}
): Promise<SearchResult> {
  const q = sanitizeForOrFilter(query);
  if (!q) return { products: [], total: 0, page, pageSize };

  const supabase = createClient();
  const from = (page - 1) * pageSize;

  const { data, count } = await supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("status", "active")
    .or(`title.ilike.%${q}%,description.ilike.%${q}%,tags.cs.{${q.toLowerCase()}}`)
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  return { products: await attachImages(data ?? []), total: count ?? 0, page, pageSize };
}
