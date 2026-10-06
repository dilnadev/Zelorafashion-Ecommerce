import type { ReactNode } from "react";
import { getSiteSettings } from "@/lib/site-settings";
import { getFeaturedCategories, getNewArrivals } from "@/lib/queries/homepage";
import { CartProvider } from "@/components/providers/CartProvider";
import { WishlistProvider } from "@/components/providers/WishlistProvider";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { FlyToCartLayer } from "@/components/storefront/FlyToCartLayer";
import { NewsletterPopup } from "@/components/storefront/NewsletterPopup";

export default async function StorefrontLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [settings, categories, cartRecommendations] = await Promise.all([
    getSiteSettings(),
    getFeaturedCategories(5),
    getNewArrivals(6),
  ]);

  return (
    <CartProvider>
      <WishlistProvider>
        {settings.announcement_bar_active && settings.announcement_bar_text && (
          <a
            href={settings.announcement_bar_link ?? "#"}
            className="block px-4 py-2 text-center text-caption uppercase tracking-[0.12em] text-white"
            style={{ backgroundColor: settings.announcement_bar_color ?? "#171717" }}
          >
            {settings.announcement_bar_text}
          </a>
        )}
        <Header settings={settings} categories={categories} />
        <main>{children}</main>
        <Footer settings={settings} />
        <CartDrawer recommendedProducts={cartRecommendations} />
        <FlyToCartLayer />
        <NewsletterPopup />
      </WishlistProvider>
    </CartProvider>
  );
}
