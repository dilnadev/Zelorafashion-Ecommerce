import { createClient } from "@/lib/supabase/server";
import { attachImages } from "@/lib/queries/shared";
import type {
  Product,
  ProductImage,
  ProductOption,
  ProductOptionValue,
  ProductVariant,
  Review,
} from "@/types";
import type { ProductCardData } from "@/components/storefront/ProductCard";

export interface OptionWithValues extends ProductOption {
  values: ProductOptionValue[];
}

export interface ProductDetail {
  product: Product;
  images: ProductImage[];
  options: OptionWithValues[];
  variants: ProductVariant[];
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const supabase = createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (!product) return null;

  const [{ data: images }, { data: options }, { data: variants }] = await Promise.all([
    supabase
      .from("product_images")
      .select("*")
      .eq("product_id", product.id)
      .order("sort_order"),
    supabase
      .from("product_options")
      .select("*")
      .eq("product_id", product.id)
      .order("sort_order"),
    supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", product.id),
  ]);

  let optionsWithValues: OptionWithValues[] = [];
  if (options && options.length > 0) {
    const { data: values } = await supabase
      .from("product_option_values")
      .select("*")
      .in(
        "option_id",
        options.map((o) => o.id)
      )
      .order("sort_order");

    optionsWithValues = options.map((option) => ({
      ...option,
      values: (values ?? []).filter((v) => v.option_id === option.id),
    }));
  }

  return {
    product,
    images: images ?? [],
    options: optionsWithValues,
    variants: variants ?? [],
  };
}

export async function getRelatedProducts(
  categoryId: string | null,
  excludeProductId: string,
  limit = 8
): Promise<ProductCardData[]> {
  if (!categoryId) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("status", "active")
    .eq("category_id", categoryId)
    .neq("id", excludeProductId)
    .limit(limit);

  return attachImages(data ?? []);
}

export interface RatingBreakdown {
  average: number;
  count: number;
  counts: Record<1 | 2 | 3 | 4 | 5, number>;
}

export async function getRatingBreakdown(productId: string): Promise<RatingBreakdown> {
  const supabase = createClient();
  const { data } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", productId);

  const counts: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0;

  for (const r of data ?? []) {
    const rating = r.rating as 1 | 2 | 3 | 4 | 5;
    if (counts[rating] != null) counts[rating] += 1;
    total += r.rating;
  }

  const count = data?.length ?? 0;
  return {
    average: count > 0 ? total / count : 0,
    count,
    counts,
  };
}

export interface ReviewsPage {
  reviews: Review[];
  total: number;
  hasMore: boolean;
}

export async function getProductReviews(
  productId: string,
  page = 1,
  pageSize = 5
): Promise<ReviewsPage> {
  const supabase = createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count } = await supabase
    .from("reviews")
    .select("*", { count: "exact" })
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .range(from, to);

  const total = count ?? 0;
  return {
    reviews: data ?? [],
    total,
    hasMore: from + pageSize < total,
  };
}
