import { createClient } from "@/lib/supabase/server";
import { attachImages } from "@/lib/queries/shared";
import { getEffectivePrice } from "@/lib/utils";
import type { ProductCardData } from "@/components/storefront/ProductCard";
import type { Category, Product } from "@/types";

// Candidate-set cap: filters/sorts that can't be pushed down to SQL (variant
// color/size, review rating, best-selling) are applied in JS against up to
// this many matching rows. Fine for a catalog of hundreds of products;
// revisit with a dedicated search index if the catalog grows much larger.
const CANDIDATE_CAP = 500;

export type SortOption =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "best-selling"
  | "rating";

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  sizes?: string[];
  minRating?: number;
  inStockOnly?: boolean;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
}

export interface ProductListResult {
  products: ProductCardData[];
  total: number;
  hasMore: boolean;
  page: number;
  pageSize: number;
}

export interface FilterOptions {
  categories: Category[];
  colors: string[];
  sizes: string[];
  priceMin: number;
  priceMax: number;
}

export async function getFilteredProducts(
  filters: ProductFilters
): Promise<ProductListResult> {
  const supabase = createClient();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 12;

  let query = supabase.from("products").select("*").eq("status", "active");

  if (filters.category) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.category)
      .maybeSingle();
    if (!category) return { products: [], total: 0, hasMore: false, page, pageSize };
    query = query.eq("category_id", category.id);
  }

  if (filters.inStockOnly) {
    query = query.or("track_inventory.eq.false,stock_quantity.gt.0");
  }

  const { data: rows } = await query.limit(CANDIDATE_CAP);
  let candidates: Product[] = rows ?? [];

  if (filters.minPrice != null) {
    candidates = candidates.filter((p) => getEffectivePrice(p) >= filters.minPrice!);
  }
  if (filters.maxPrice != null) {
    candidates = candidates.filter((p) => getEffectivePrice(p) <= filters.maxPrice!);
  }

  if ((filters.colors?.length || filters.sizes?.length) && candidates.length > 0) {
    const ids = candidates.map((p) => p.id);
    const { data: variants } = await supabase
      .from("product_variants")
      .select("product_id, option_values")
      .in("product_id", ids);

    const productOptionValues = new Map<string, Set<string>>();
    for (const v of variants ?? []) {
      const set = productOptionValues.get(v.product_id) ?? new Set<string>();
      for (const ov of v.option_values as { option_name: string; value: string }[]) {
        set.add(`${ov.option_name.toLowerCase()}:${ov.value.toLowerCase()}`);
      }
      productOptionValues.set(v.product_id, set);
    }

    if (filters.colors?.length) {
      const wanted = filters.colors.map((c) => `color:${c.toLowerCase()}`);
      candidates = candidates.filter((p) => {
        const set = productOptionValues.get(p.id);
        return set && wanted.some((w) => set.has(w));
      });
    }
    if (filters.sizes?.length) {
      const wanted = filters.sizes.map((s) => `size:${s.toLowerCase()}`);
      candidates = candidates.filter((p) => {
        const set = productOptionValues.get(p.id);
        return set && wanted.some((w) => set.has(w));
      });
    }
  }

  let ratingByProduct = new Map<string, number>();
  if ((filters.minRating != null || filters.sort === "rating") && candidates.length > 0) {
    const ids = candidates.map((p) => p.id);
    const { data: reviews } = await supabase
      .from("reviews")
      .select("product_id, rating")
      .in("product_id", ids);

    const sums = new Map<string, { total: number; count: number }>();
    for (const r of reviews ?? []) {
      const entry = sums.get(r.product_id) ?? { total: 0, count: 0 };
      entry.total += r.rating;
      entry.count += 1;
      sums.set(r.product_id, entry);
    }
    ratingByProduct = new Map(
      Array.from(sums.entries()).map(([id, { total, count }]) => [id, total / count])
    );

    if (filters.minRating != null) {
      candidates = candidates.filter(
        (p) => (ratingByProduct.get(p.id) ?? 0) >= filters.minRating!
      );
    }
  }

  const unitsSoldByProduct = new Map<string, number>();
  if (filters.sort === "best-selling" && candidates.length > 0) {
    const ids = candidates.map((p) => p.id);
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .in("product_id", ids);
    for (const item of orderItems ?? []) {
      if (!item.product_id) continue;
      unitsSoldByProduct.set(
        item.product_id,
        (unitsSoldByProduct.get(item.product_id) ?? 0) + item.quantity
      );
    }
  }

  const sort = filters.sort ?? "newest";
  candidates = [...candidates].sort((a, b) => {
    switch (sort) {
      case "price-asc":
        return getEffectivePrice(a) - getEffectivePrice(b);
      case "price-desc":
        return getEffectivePrice(b) - getEffectivePrice(a);
      case "best-selling":
        return (unitsSoldByProduct.get(b.id) ?? 0) - (unitsSoldByProduct.get(a.id) ?? 0);
      case "rating":
        return (ratingByProduct.get(b.id) ?? 0) - (ratingByProduct.get(a.id) ?? 0);
      case "newest":
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const total = candidates.length;
  const start = (page - 1) * pageSize;
  const pageRows = candidates.slice(start, start + pageSize);

  const productCards = await attachImages(pageRows);

  return {
    products: productCards,
    total,
    hasMore: start + pageSize < total,
    page,
    pageSize,
  };
}

export async function getFilterOptions(): Promise<FilterOptions> {
  const supabase = createClient();

  const [{ data: categories }, { data: options }, { data: lowest }, { data: highest }] =
    await Promise.all([
      supabase.from("categories").select("*").order("sort_order"),
      supabase.from("product_options").select("id, name"),
      supabase
        .from("products")
        .select("price")
        .eq("status", "active")
        .order("price", { ascending: true })
        .limit(1),
      supabase
        .from("products")
        .select("price")
        .eq("status", "active")
        .order("price", { ascending: false })
        .limit(1),
    ]);

  let colors: string[] = [];
  let sizes: string[] = [];

  const colorOptionIds = (options ?? [])
    .filter((o) => o.name.toLowerCase() === "color")
    .map((o) => o.id);
  const sizeOptionIds = (options ?? [])
    .filter((o) => o.name.toLowerCase() === "size")
    .map((o) => o.id);
  const allOptionIds = [...colorOptionIds, ...sizeOptionIds];

  if (allOptionIds.length > 0) {
    const { data: values } = await supabase
      .from("product_option_values")
      .select("option_id, value")
      .in("option_id", allOptionIds);

    const colorSet = new Set<string>();
    const sizeSet = new Set<string>();
    for (const v of values ?? []) {
      if (colorOptionIds.includes(v.option_id)) colorSet.add(v.value);
      else sizeSet.add(v.value);
    }
    colors = Array.from(colorSet).sort();
    sizes = Array.from(sizeSet).sort();
  }

  return {
    categories: categories ?? [],
    colors,
    sizes,
    priceMin: lowest?.[0]?.price ?? 0,
    priceMax: highest?.[0]?.price ?? 10000,
  };
}
