import { getActiveShippingMethods } from "@/lib/queries/checkout";
import { getSiteSettings } from "@/lib/site-settings";
import { createClient } from "@/lib/supabase/server";
import { CheckoutFlow } from "@/components/storefront/checkout/CheckoutFlow";

export default async function CheckoutPage() {
  const supabase = createClient();
  const [shippingMethods, settings, { data: { user } }] = await Promise.all([
    getActiveShippingMethods(),
    getSiteSettings(),
    supabase.auth.getUser(),
  ]);

  return (
    <div className="mx-auto max-w-content px-6 py-10 md:px-16">
      <h1 className="mb-10 text-center font-serif text-section text-ink">Checkout</h1>
      <CheckoutFlow
        shippingMethods={shippingMethods}
        siteName={settings.site_name}
        defaultEmail={user?.email ?? ""}
      />
    </div>
  );
}
