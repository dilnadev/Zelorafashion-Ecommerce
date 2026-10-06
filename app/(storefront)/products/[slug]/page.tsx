import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getProductBySlug,
  getRelatedProducts,
  getRatingBreakdown,
  getProductReviews,
} from "@/lib/queries/product-detail";
import { createClient } from "@/lib/supabase/server";
import { ProductDetailInteractive } from "@/components/storefront/ProductDetailInteractive";
import { Accordion, AccordionItem } from "@/components/ui/Accordion";
import { ReviewsSection } from "@/components/storefront/ReviewsSection";
import { RelatedProducts } from "@/components/storefront/RelatedProducts";
import { RecentlyViewed } from "@/components/storefront/RecentlyViewed";
import { formatCurrency } from "@/lib/utils";

export const revalidate = 60;

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const detail = await getProductBySlug(params.slug);
  if (!detail) return {};

  return {
    title: detail.product.meta_title ?? detail.product.title,
    description:
      detail.product.meta_description ??
      detail.product.description?.replace(/<[^>]*>/g, "").slice(0, 160),
    openGraph: detail.product.og_image_url
      ? { images: [detail.product.og_image_url] }
      : undefined,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const detail = await getProductBySlug(params.slug);
  if (!detail) notFound();

  const { product, images, options, variants } = detail;

  const supabase = createClient();
  const [{ data: category }, related, breakdown, reviewsPage] = await Promise.all([
    product.category_id
      ? supabase.from("categories").select("name, slug").eq("id", product.category_id).maybeSingle()
      : Promise.resolve({ data: null }),
    getRelatedProducts(product.category_id, product.id),
    getRatingBreakdown(product.id),
    getProductReviews(product.id, 1, 5),
  ]);

  const imageUrls = images.map((i) => i.image_url);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description?.replace(/<[^>]*>/g, ""),
    sku: product.sku,
    image: imageUrls,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.sale_price ?? product.price,
      availability:
        product.track_inventory && product.stock_quantity <= 0
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
    },
    ...(breakdown.count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: breakdown.average.toFixed(1),
            reviewCount: breakdown.count,
          },
        }
      : {}),
  };

  return (
    <div className="mx-auto max-w-content px-6 py-10 md:px-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="mb-8 text-caption normal-case tracking-normal text-ink-muted">
        <Link href="/" className="hover:text-accent">
          Home
        </Link>
        <span className="mx-2">/</span>
        {category ? (
          <>
            <Link href={`/products?category=${category.slug}`} className="hover:text-accent">
              {category.name}
            </Link>
            <span className="mx-2">/</span>
          </>
        ) : (
          <>
            <Link href="/products" className="hover:text-accent">
              Shop
            </Link>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-ink">{product.title}</span>
      </nav>

      <ProductDetailInteractive
        product={product}
        images={imageUrls}
        options={options}
        variants={variants}
        ratingAverage={breakdown.average}
        ratingCount={breakdown.count}
      />

      <div className="mx-auto mt-16 max-w-3xl">
        <Accordion defaultOpen="description">
          <AccordionItem id="description" title="Description">
            {product.description ? (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            ) : (
              <p>No description available.</p>
            )}
          </AccordionItem>

          <AccordionItem id="specifications" title="Specifications">
            <table className="w-full text-left">
              <tbody>
                <tr className="border-b border-black/[0.06]">
                  <td className="py-2 pr-4 text-ink">SKU</td>
                  <td className="py-2">{product.sku}</td>
                </tr>
                {category && (
                  <tr className="border-b border-black/[0.06]">
                    <td className="py-2 pr-4 text-ink">Category</td>
                    <td className="py-2">{category.name}</td>
                  </tr>
                )}
                <tr className="border-b border-black/[0.06]">
                  <td className="py-2 pr-4 text-ink">Price</td>
                  <td className="py-2">{formatCurrency(product.price)}</td>
                </tr>
                {product.tags.length > 0 && (
                  <tr>
                    <td className="py-2 pr-4 text-ink">Tags</td>
                    <td className="py-2">{product.tags.join(", ")}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </AccordionItem>

          <AccordionItem id="shipping" title="Shipping & Returns">
            <p>
              Orders are typically processed within 1–2 business days. Once
              shipped, delivery takes 3–7 business days depending on your
              location. If you&apos;re not satisfied, items can be returned
              within 30 days of delivery in their original condition.
            </p>
          </AccordionItem>
        </Accordion>

        <div id="reviews" className="mt-16 scroll-mt-24">
          <h2 className="mb-8 font-serif text-section text-ink">Customer Reviews</h2>
          <ReviewsSection
            productId={product.id}
            productSlug={product.slug}
            initialReviews={reviewsPage}
            breakdown={breakdown}
          />
        </div>
      </div>

      <RelatedProducts products={related} />
      <RecentlyViewed productId={product.id} />
    </div>
  );
}
