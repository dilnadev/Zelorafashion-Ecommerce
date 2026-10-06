"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/providers/ToastProvider";
import { upsertPageSeo, deletePageSeo, type PageSeoInput } from "@/app/(admin)/admin/seo/actions";
import type { PageSeo } from "@/types";

const EMPTY_FORM: PageSeoInput = { pageSlug: "", metaTitle: "", metaDescription: "", ogImageUrl: "" };

export function PageSeoManager({ initialPages }: { initialPages: PageSeo[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<PageSeo | null>(null);
  const [deleting, setDeleting] = useState<PageSeo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [form, setForm] = useState<PageSeoInput>(EMPTY_FORM);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  }

  function openEdit(page: PageSeo) {
    setEditing(page);
    setForm({
      pageSlug: page.page_slug,
      metaTitle: page.meta_title ?? "",
      metaDescription: page.meta_description ?? "",
      ogImageUrl: page.og_image_url ?? "",
    });
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await upsertPageSeo(form, editing?.id);
    setIsSubmitting(false);

    if (!result.success) {
      toast({ title: "Something went wrong", description: result.message, variant: "error" });
      return;
    }
    toast({ title: editing ? "Page SEO updated" : "Page SEO created", variant: "success" });
    setIsModalOpen(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!deleting) return;
    setIsDeleting(true);
    const result = await deletePageSeo(deleting.id);
    setIsDeleting(false);

    if (!result.success) {
      toast({ title: "Couldn't delete entry", description: result.message, variant: "error" });
      return;
    }
    toast({ title: "Page SEO deleted", variant: "success" });
    setDeleting(null);
    router.refresh();
  }

  return (
    <section className="rounded-2xl border border-black/[0.06] bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-lg text-ink">Per-Page SEO</h2>
          <p className="text-caption normal-case tracking-normal text-ink-muted">
            e.g. home, about, contact, faq, privacy-policy, terms-of-service
          </p>
        </div>
        <Button size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={openAdd}>
          Add Page
        </Button>
      </div>

      {initialPages.length === 0 ? (
        <p className="text-body text-ink-muted">No per-page SEO entries yet.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-black/[0.06]">
          <table className="w-full text-left">
            <thead className="border-b border-black/[0.06] bg-black/[0.02]">
              <tr className="text-caption text-ink-muted">
                <th className="px-4 py-2 font-normal">Page</th>
                <th className="px-4 py-2 font-normal">Meta title</th>
                <th className="px-4 py-2 font-normal">Meta description</th>
                <th className="px-4 py-2 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.06]">
              {initialPages.map((page) => (
                <tr key={page.id}>
                  <td className="px-4 py-3 text-body text-ink">{page.page_slug}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-body text-ink-muted">{page.meta_title}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-body text-ink-muted">{page.meta_description}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(page)}
                        aria-label={`Edit ${page.page_slug}`}
                        className="cursor-pointer rounded-full p-1.5 text-ink-muted transition-colors hover:bg-black/[0.04] hover:text-ink"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(page)}
                        aria-label={`Delete ${page.page_slug}`}
                        className="cursor-pointer rounded-full p-1.5 text-ink-muted transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? "Edit Page SEO" : "Add Page SEO"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Page slug (e.g. home, about, contact)"
            required
            disabled={Boolean(editing)}
            value={form.pageSlug}
            onChange={(e) => setForm({ ...form, pageSlug: e.target.value })}
          />
          <Input
            label="Meta title"
            value={form.metaTitle}
            onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
          />
          <div>
            <label htmlFor="page-seo-meta-description" className="mb-1.5 block text-caption text-ink-muted">
              Meta description
            </label>
            <textarea
              id="page-seo-meta-description"
              value={form.metaDescription}
              onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-black/10 p-4 text-body text-ink outline-none focus:border-accent"
            />
          </div>
          <Input
            label="OG image URL"
            value={form.ogImageUrl}
            onChange={(e) => setForm({ ...form, ogImageUrl: e.target.value })}
          />
          <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
            Save Page SEO
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleting)}
        title="Delete page SEO entry"
        description={`Are you sure you want to delete SEO settings for "${deleting?.page_slug}"?`}
        isConfirming={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </section>
  );
}
