"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SingleImageUpload } from "@/components/admin/SingleImageUpload";
import { useToast } from "@/components/providers/ToastProvider";
import { updateSiteSettings } from "@/app/(admin)/admin/settings/actions";
import type { SiteSettings } from "@/types";

const EMPTY: Partial<SiteSettings> = {
  site_name: "Store",
  tagline: "",
  logo_url: null,
  logo_inverted_url: null,
  favicon_url: null,
  contact_email: "",
  contact_phone: "",
  business_address: "",
  currency_code: "INR",
  currency_symbol: "₹",
  tax_rate: 0,
  tax_inclusive: false,
  announcement_bar_active: false,
  announcement_bar_text: "",
  announcement_bar_link: "",
  announcement_bar_color: "#171717",
  social_instagram: "",
  social_facebook: "",
  social_twitter: "",
  social_tiktok: "",
  social_youtube: "",
};

export function SiteSettingsForm({ settings }: { settings: SiteSettings | null }) {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState<Partial<SiteSettings>>(settings ?? EMPTY);
  const [isSaving, setIsSaving] = useState(false);

  function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setIsSaving(true);
    const result = await updateSiteSettings(form);
    setIsSaving(false);

    if (!result.success) {
      toast({ title: "Couldn't save settings", description: result.message, variant: "error" });
      return;
    }
    toast({ title: "Settings saved", variant: "success" });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-black/[0.06] bg-white p-6">
        <h2 className="mb-4 font-serif text-lg text-ink">Brand</h2>
        <div className="mb-4 flex flex-wrap gap-6">
          <SingleImageUpload
            label="Primary logo (header)"
            bucket="brand-assets"
            value={form.logo_url ?? null}
            onChange={(url) => set("logo_url", url)}
          />
          <SingleImageUpload
            label="Inverted logo (footer)"
            bucket="brand-assets"
            value={form.logo_inverted_url ?? null}
            onChange={(url) => set("logo_inverted_url", url)}
          />
          <SingleImageUpload
            label="Favicon"
            bucket="brand-assets"
            value={form.favicon_url ?? null}
            onChange={(url) => set("favicon_url", url)}
            aspectClassName="h-28 w-28"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Site name" value={form.site_name ?? ""} onChange={(e) => set("site_name", e.target.value)} />
          <Input label="Tagline" value={form.tagline ?? ""} onChange={(e) => set("tagline", e.target.value)} />
        </div>
      </section>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-6">
        <h2 className="mb-4 font-serif text-lg text-ink">Contact Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Business email"
            value={form.contact_email ?? ""}
            onChange={(e) => set("contact_email", e.target.value)}
          />
          <Input
            label="Business phone"
            value={form.contact_phone ?? ""}
            onChange={(e) => set("contact_phone", e.target.value)}
          />
        </div>
        <div className="mt-4">
          <Input
            label="Business address"
            value={form.business_address ?? ""}
            onChange={(e) => set("business_address", e.target.value)}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-6">
        <h2 className="mb-4 font-serif text-lg text-ink">Social Media Links</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Instagram URL"
            value={form.social_instagram ?? ""}
            onChange={(e) => set("social_instagram", e.target.value)}
          />
          <Input
            label="Facebook URL"
            value={form.social_facebook ?? ""}
            onChange={(e) => set("social_facebook", e.target.value)}
          />
          <Input
            label="Twitter / X URL"
            value={form.social_twitter ?? ""}
            onChange={(e) => set("social_twitter", e.target.value)}
          />
          <Input
            label="TikTok URL"
            value={form.social_tiktok ?? ""}
            onChange={(e) => set("social_tiktok", e.target.value)}
          />
          <Input
            label="YouTube URL"
            value={form.social_youtube ?? ""}
            onChange={(e) => set("social_youtube", e.target.value)}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-6">
        <h2 className="mb-4 font-serif text-lg text-ink">Announcement Bar</h2>
        <label className="mb-4 flex items-center gap-2 text-body text-ink">
          <input
            type="checkbox"
            checked={form.announcement_bar_active ?? false}
            onChange={(e) => set("announcement_bar_active", e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded border-black/20"
          />
          Show announcement bar
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Text"
            value={form.announcement_bar_text ?? ""}
            onChange={(e) => set("announcement_bar_text", e.target.value)}
          />
          <Input
            label="Link URL"
            value={form.announcement_bar_link ?? ""}
            onChange={(e) => set("announcement_bar_link", e.target.value)}
          />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <label className="text-caption normal-case tracking-normal text-ink-muted">Background color</label>
          <input
            type="color"
            value={form.announcement_bar_color ?? "#171717"}
            onChange={(e) => set("announcement_bar_color", e.target.value)}
            className="h-9 w-14 cursor-pointer rounded-lg border border-black/10"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-6">
        <h2 className="mb-4 font-serif text-lg text-ink">Currency & Tax</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Currency code"
            value={form.currency_code ?? "INR"}
            onChange={(e) => set("currency_code", e.target.value.toUpperCase())}
          />
          <Input
            label="Currency symbol"
            value={form.currency_symbol ?? "₹"}
            onChange={(e) => set("currency_symbol", e.target.value)}
          />
          <Input
            label="Tax rate (%)"
            type="number"
            value={form.tax_rate ?? 0}
            onChange={(e) => set("tax_rate", Number(e.target.value))}
          />
          <label className="flex items-center gap-2 text-body text-ink">
            <input
              type="checkbox"
              checked={form.tax_inclusive ?? false}
              onChange={(e) => set("tax_inclusive", e.target.checked)}
              className="h-4 w-4 cursor-pointer rounded border-black/20"
            />
            Prices are tax-inclusive
          </label>
        </div>
      </section>

      <div className="flex justify-end">
        <Button onClick={handleSave} isLoading={isSaving}>
          Save Settings
        </Button>
      </div>
    </div>
  );
}
