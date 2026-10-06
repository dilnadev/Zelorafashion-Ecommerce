import Link from "next/link";
import type { Metadata } from "next";
import {
  getActiveHeroSlides,
  getFeaturedCategories,
  getNewArrivals,
  getBestSellers,
  getActiveSale,
} from "@/lib/queries/homepage";
import { HeroCarousel } from "@/components/storefront/HeroCarousel";
import { FeaturedCategories } from "@/components/storefront/FeaturedCategories";
import { FeaturedCollection } from "@/components/storefront/FeaturedCollection";
import { EditorialBanner } from "@/components/storefront/EditorialBanner";
import { SignatureCollections } from "@/components/storefront/SignatureCollections";
import { BrandStory } from "@/components/storefront/BrandStory";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import { SaleBanner } from "@/components/storefront/SaleBanner";
import { TrustBadges } from "@/components/storefront/TrustBadges";
import { Newsletter } from "@/components/storefront/Newsletter";
import { getSiteSettings } from "@/lib/site-settings";
import { createClient } from "@/lib/supabase/server";
import { PLACEHOLDER_IMAGES } from "@/lib/placeholder-images";
import Image from "next/image";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createClient();
  const { data: pageSeo } = await supabase.from("page_seo").select("*").eq("page_slug", "home").maybeSingle();
  if (!pageSeo) return {};

  return {
    title: pageSeo.meta_title ?? undefined,
    description: pageSeo.meta_description ?? undefined,
    openGraph: pageSeo.og_image_url ? { images: [pageSeo.og_image_url] } : undefined,
  };
}

export default async function Home() {
  const siteSettings = await getSiteSettings();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteSettings.site_name,
    url: baseUrl,
    logo: siteSettings.logo_url ?? undefined,
    sameAs: [
      siteSettings.social_instagram,
      siteSettings.social_facebook,
      siteSettings.social_twitter,
      siteSettings.social_tiktok,
      siteSettings.social_youtube,
    ].filter(Boolean),
  };

  const [heroSlides, categories, newArrivals, bestSellers, activeSale] =
    await Promise.all([
      getActiveHeroSlides(),
      getFeaturedCategories(),
      getNewArrivals(),
      getBestSellers(),
      getActiveSale(),
    ]);

  const hasNoContent =
    heroSlides.length === 0 &&
    categories.length === 0 &&
    newArrivals.length === 0;

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      {heroSlides.length > 0 ? (
        <HeroCarousel slides={heroSlides} />
      ) : (
        <section className="relative flex h-[85vh] min-h-[560px] w-full flex-col items-center justify-center gap-6 overflow-hidden bg-ink px-6 text-center">
          <Image
            src={PLACEHOLDER_IMAGES.hero}
            alt={siteSettings.site_name}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-ink/35" />
          <div className="relative z-10 flex flex-col items-center gap-6">
            <p className="text-caption uppercase tracking-[0.12em] text-white/80">The New Season</p>
            <h1 className="max-w-2xl font-serif text-hero text-white">
              {siteSettings.tagline || "A study in modern femininity."}
            </h1>
            <Link
              href="/products"
              className="mt-2 inline-flex h-14 items-center justify-center rounded bg-white px-9 text-caption uppercase tracking-[0.12em] text-ink transition-colors hover:bg-white/90"
            >
              Explore the Collection
            </Link>
          </div>
        </section>
      )}

      <FeaturedCollection />

      <FeaturedCategories categories={categories} />

      {activeSale && (
        <SaleBanner
          productTitle={activeSale.productTitle}
          productSlug={activeSale.productSlug}
          saleEnd={activeSale.saleEnd}
        />
      )}

      {newArrivals.length > 0 && (
        <section className="mx-auto max-w-content px-6 py-20 md:px-16 md:py-30">
          <p className="mb-2 text-caption uppercase tracking-[0.12em] text-accent">Just In</p>
          <h2 className="mb-10 font-serif text-section text-ink">New Arrivals</h2>
          <ProductGrid products={newArrivals} />
        </section>
      )}

      <EditorialBanner />

      {bestSellers.length > 0 && (
        <section className="mx-auto max-w-content px-6 py-20 md:px-16 md:py-30">
          <p className="mb-2 text-caption uppercase tracking-[0.12em] text-accent">The Edit</p>
          <h2 className="mb-10 font-serif text-section text-ink">Best Sellers</h2>
          <ProductGrid products={bestSellers} />
        </section>
      )}

      <SignatureCollections />

      <BrandStory settings={siteSettings} />

      {hasNoContent && (
        <section className="mx-auto max-w-content px-6 py-20 text-center md:px-16">
          <p className="text-body text-ink-muted">
            No products or content yet — add some via Supabase&apos;s Table
            Editor, or wait for the admin panel in a later phase.
          </p>
        </section>
      )}

      <TrustBadges />
      <Newsletter />
    </div>
  );
}
