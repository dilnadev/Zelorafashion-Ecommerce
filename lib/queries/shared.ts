import { createClient } from "@/lib/supabase/server";
import type { ProductCardData } from "@/components/storefront/ProductCard";
import type { Product } from "@/types";

export async function attachImages(products: Product[]): Promise<ProductCardData[]> {
  if (products.length === 0) return [];
  const supabase = createClient();
  const ids = products.map((p) => p.id);
  const { data: images } = await supabase
    .from("product_images")
    .select("*")
    .in("product_id", ids)
    .order("sort_order");

  const imagesByProduct = new Map<string, string[]>();
  for (const image of images ?? []) {
    const list = imagesByProduct.get(image.product_id) ?? [];
    list.push(image.image_url);
    imagesByProduct.set(image.product_id, list);
  }

  return products.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    price: p.price,
    sale_price: p.sale_price,
    sale_start: p.sale_start,
    sale_end: p.sale_end,
    stock_quantity: p.stock_quantity,
    track_inventory: p.track_inventory,
    created_at: p.created_at,
    images: imagesByProduct.get(p.id) ?? [],
  }));
}
