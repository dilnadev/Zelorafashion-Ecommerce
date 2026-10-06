import { createClient } from "@/lib/supabase/server";
import type {
  Product,
  ProductImage,
  ProductOption,
  ProductOptionValue,
  ProductVariant,
} from "@/types";
import type { ProductStatus } from "@/types/database";

export interface AdminProductListItem {
  id: string;
  title: string;
  sku: string;
  price: number;
  sale_price: number | null;
  stock_quantity: number;
  status: ProductStatus;
  category_name: string | null;
  image_url: string | null;
}

export interface AdminProductListResult {
  products: AdminProductListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export type AdminProductSort = "created_at" | "title" | "price" | "stock_quantity";

export interface AdminProductListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: AdminProductSort;
  sortDir?: "asc" | "desc";
}

export async function getAdminProducts({
  page = 1,
  pageSize = 20,
  search,
  sortBy = "created_at",
  sortDir = "desc",
}: AdminProductListParams): Promise<AdminProductListResult> {
  const supabase = createClient();

  let query = supabase.from("products").select("*", { count: "exact" });
  if (search) {
    query = query.or(`title.ilike.%${search}%,sku.ilike.%${search}%`);
  }
  query = query.order(sortBy, { ascending: sortDir === "asc" });

  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);

  const { data: products, count } = await query;
  const rows = products ?? [];

  const categoryIds = Array.from(
    new Set(rows.map((p) => p.category_id).filter((id): id is string => Boolean(id)))
  );
  const productIds = rows.map((p) => p.id);

  const [{ data: categories }, { data: images }] = await Promise.all([
    categoryIds.length
      ? supabase.from("categories").select("id, name").in("id", categoryIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    productIds.length
      ? supabase
          .from("product_images")
          .select("product_id, image_url, sort_order")
          .in("product_id", productIds)
          .order("sort_order")
      : Promise.resolve({ data: [] as { product_id: string; image_url: string }[] }),
  ]);

  const categoryNameById = new Map((categories ?? []).map((c) => [c.id, c.name]));
  const firstImageByProduct = new Map<string, string>();
  for (const img of images ?? []) {
    if (!firstImageByProduct.has(img.product_id)) {
      firstImageByProduct.set(img.product_id, img.image_url);
    }
  }

  return {
    products: rows.map((p) => ({
      id: p.id,
      title: p.title,
      sku: p.sku,
      price: p.price,
      sale_price: p.sale_price,
      stock_quantity: p.stock_quantity,
      status: p.status,
      category_name: p.category_id ? categoryNameById.get(p.category_id) ?? null : null,
      image_url: firstImageByProduct.get(p.id) ?? null,
    })),
    total: count ?? 0,
    page,
    pageSize,
  };
}

export interface OptionWithValues extends ProductOption {
  values: ProductOptionValue[];
}

export interface AdminProductDetail {
  product: Product;
  images: ProductImage[];
  options: OptionWithValues[];
  variants: ProductVariant[];
}

export async function getAdminProductById(id: string): Promise<AdminProductDetail | null> {
  const supabase = createClient();

  const { data: product } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (!product) return null;

  const [{ data: images }, { data: options }, { data: variants }] = await Promise.all([
    supabase.from("product_images").select("*").eq("product_id", id).order("sort_order"),
    supabase.from("product_options").select("*").eq("product_id", id).order("sort_order"),
    supabase.from("product_variants").select("*").eq("product_id", id),
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
