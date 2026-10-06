import type { Database } from "./database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type SiteSettings = Database["public"]["Tables"]["site_settings"]["Row"];
export type SeoSettings = Database["public"]["Tables"]["seo_settings"]["Row"];
export type PageSeo = Database["public"]["Tables"]["page_seo"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductImage =
  Database["public"]["Tables"]["product_images"]["Row"];
export type ProductOption =
  Database["public"]["Tables"]["product_options"]["Row"];
export type ProductOptionValue =
  Database["public"]["Tables"]["product_option_values"]["Row"];
export type ProductVariant =
  Database["public"]["Tables"]["product_variants"]["Row"];
export type Address = Database["public"]["Tables"]["addresses"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type OrderTimelineEntry =
  Database["public"]["Tables"]["order_timeline"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type Coupon = Database["public"]["Tables"]["coupons"]["Row"];
export type Subscriber = Database["public"]["Tables"]["subscribers"]["Row"];
export type HeroSlide = Database["public"]["Tables"]["hero_slides"]["Row"];
export type WishlistItem = Database["public"]["Tables"]["wishlist"]["Row"];
export type MediaAsset = Database["public"]["Tables"]["media"]["Row"];
export type ShippingMethod =
  Database["public"]["Tables"]["shipping_methods"]["Row"];

export interface ProductWithImages extends Product {
  product_images: ProductImage[];
  category?: Category | null;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId: string | null;
  title: string;
  slug: string;
  image: string | null;
  variantLabel: string | null;
  unitPrice: number;
  quantity: number;
  maxQuantity: number;
}
