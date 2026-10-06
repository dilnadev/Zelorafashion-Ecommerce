import { getSiteSettingsRow, getAdminShippingMethods, getAdminHeroSlides } from "@/lib/queries/admin-settings";
import { SiteSettingsForm } from "@/components/admin/SiteSettingsForm";
import { ShippingMethodsManager } from "@/components/admin/ShippingMethodsManager";
import { HeroSlidesManager } from "@/components/admin/HeroSlidesManager";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const [settings, shippingMethods, heroSlides] = await Promise.all([
    getSiteSettingsRow(),
    getAdminShippingMethods(),
    getAdminHeroSlides(),
  ]);

  return (
    <div>
      <h1 className="mb-8 font-serif text-section text-ink">Settings</h1>
      <div className="space-y-6">
        <SiteSettingsForm settings={settings} />
        <ShippingMethodsManager initialMethods={shippingMethods} />
        <HeroSlidesManager initialSlides={heroSlides} />
      </div>
    </div>
  );
}
