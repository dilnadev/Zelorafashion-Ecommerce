"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SingleImageUpload } from "@/components/admin/SingleImageUpload";
import { useToast } from "@/components/providers/ToastProvider";
import { updateSeoSettings } from "@/app/(admin)/admin/seo/actions";
import type { SeoSettings } from "@/types";

const EMPTY: Partial<SeoSettings> = {
  meta_title_template: "{Page Title} | {Site Name}",
  default_meta_description: "",
  og_default_image_url: null,
  ga_tracking_id: "",
  fb_pixel_id: "",
  search_console_meta: "",
  robots_txt: "User-agent: *\nAllow: /\n",
};

export function SeoSettingsForm({ settings }: { settings: SeoSettings | null }) {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState<Partial<SeoSettings>>(settings ?? EMPTY);
  const [isSaving, setIsSaving] = useState(false);

  function set<K extends keyof SeoSettings>(key: K, value: SeoSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setIsSaving(true);
    const result = await updateSeoSettings(form);
    setIsSaving(false);

    if (!result.success) {
      toast({ title: "Couldn't save SEO settings", description: result.message, variant: "error" });
      return;
    }
    toast({ title: "SEO settings saved", variant: "success" });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-black/[0.06] bg-white p-6">
        <h2 className="mb-4 font-serif text-lg text-ink">Global SEO</h2>
        <div className="space-y-4">
          <Input
            label="Meta title template"
            value={form.meta_title_template ?? ""}
            onChange={(e) => set("meta_title_template", e.target.value)}
          />
          <p className="-mt-2 text-caption normal-case tracking-normal text-ink-muted">
            Use {"{Page Title}"} and {"{Site Name}"} as placeholders.
          </p>
          <div>
            <label htmlFor="default-meta-description" className="mb-1.5 block text-caption text-ink-muted">
              Default meta description
            </label>
            <textarea
              id="default-meta-description"
              value={form.default_meta_description ?? ""}
              onChange={(e) => set("default_meta_description", e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-black/10 p-4 text-body text-ink outline-none focus:border-accent"
            />
          </div>
          <SingleImageUpload
            label="Default OG image"
            bucket="brand-assets"
            value={form.og_default_image_url ?? null}
            onChange={(url) => set("og_default_image_url", url)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Google Analytics (GA4) ID"
              value={form.ga_tracking_id ?? ""}
              onChange={(e) => set("ga_tracking_id", e.target.value)}
            />
            <Input
              label="Facebook Pixel ID"
              value={form.fb_pixel_id ?? ""}
              onChange={(e) => set("fb_pixel_id", e.target.value)}
            />
          </div>
          <Input
            label="Search Console verification meta tag"
            value={form.search_console_meta ?? ""}
            onChange={(e) => set("search_console_meta", e.target.value)}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-6">
        <h2 className="mb-4 font-serif text-lg text-ink">robots.txt</h2>
        <textarea
          value={form.robots_txt ?? ""}
          onChange={(e) => set("robots_txt", e.target.value)}
          rows={6}
          className="w-full rounded-xl border border-black/10 p-4 font-mono text-body text-ink outline-none focus:border-accent"
        />
        <p className="mt-2 text-caption normal-case tracking-normal text-ink-muted">
          Served live at /robots.txt.
        </p>
      </section>

      <div className="flex justify-end">
        <Button onClick={handleSave} isLoading={isSaving}>
          Save SEO Settings
        </Button>
      </div>
    </div>
  );
}
