import { getSeoSettingsRow, getPageSeoList } from "@/lib/queries/admin-settings";
import { SeoSettingsForm } from "@/components/admin/SeoSettingsForm";
import { PageSeoManager } from "@/components/admin/PageSeoManager";

export const revalidate = 0;

export default async function AdminSeoPage() {
  const [settings, pages] = await Promise.all([getSeoSettingsRow(), getPageSeoList()]);

  return (
    <div>
      <h1 className="mb-8 font-serif text-section text-ink">SEO</h1>
      <div className="space-y-6">
        <SeoSettingsForm settings={settings} />
        <PageSeoManager initialPages={pages} />
      </div>
    </div>
  );
}
