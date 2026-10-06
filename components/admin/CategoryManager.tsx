"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { SingleImageUpload } from "@/components/admin/SingleImageUpload";
import { useToast } from "@/components/providers/ToastProvider";
import { slugify } from "@/lib/utils";
import { createCategory, updateCategory, deleteCategory } from "@/app/(admin)/admin/categories/actions";
import type { Category } from "@/types";

export function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  function openAdd() {
    setEditing(null);
    setName("");
    setSlug("");
    setSlugTouched(false);
    setDescription("");
    setImageUrl(null);
    setIsModalOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setName(category.name);
    setSlug(category.slug);
    setSlugTouched(true);
    setDescription(category.description ?? "");
    setImageUrl(category.image_url ?? null);
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    const input = { name, slug: slug || slugify(name), description, image_url: imageUrl };
    const result = editing ? await updateCategory(editing.id, input) : await createCategory(input);
    setIsSubmitting(false);

    if (!result.success) {
      toast({ title: "Something went wrong", description: result.message, variant: "error" });
      return;
    }

    toast({ title: editing ? "Category updated" : "Category created", variant: "success" });
    setIsModalOpen(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!deleting) return;
    setIsDeleting(true);
    const result = await deleteCategory(deleting.id);
    setIsDeleting(false);

    if (!result.success) {
      toast({ title: "Couldn't delete category", description: result.message, variant: "error" });
      return;
    }

    toast({ title: "Category deleted", variant: "success" });
    setDeleting(null);
    router.refresh();
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-section text-ink">Categories</h1>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openAdd}>
          Add Category
        </Button>
      </div>

      {initialCategories.length === 0 ? (
        <p className="text-body text-ink-muted">No categories yet.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
          <table className="w-full text-left">
            <thead className="border-b border-black/[0.06] bg-black/[0.02]">
              <tr className="text-caption text-ink-muted">
                <th className="px-5 py-3 font-normal">Image</th>
                <th className="px-5 py-3 font-normal">Name</th>
                <th className="px-5 py-3 font-normal">Slug</th>
                <th className="px-5 py-3 font-normal">Description</th>
                <th className="px-5 py-3 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.06]">
              {initialCategories.map((category) => (
                <tr key={category.id}>
                  <td className="px-5 py-3">
                    <div className="relative h-12 w-10 overflow-hidden rounded bg-black/[0.03]">
                      {category.image_url && (
                        <Image src={category.image_url} alt={category.name} fill className="object-cover" sizes="40px" />
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-body text-ink">{category.name}</td>
                  <td className="px-5 py-3 text-body text-ink-muted">{category.slug}</td>
                  <td className="max-w-xs truncate px-5 py-3 text-body text-ink-muted">
                    {category.description}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(category)}
                        aria-label={`Edit ${category.name}`}
                        className="cursor-pointer rounded-full p-1.5 text-ink-muted transition-colors hover:bg-black/[0.04] hover:text-ink"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(category)}
                        aria-label={`Delete ${category.name}`}
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? "Edit Category" : "Add Category"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <SingleImageUpload
            label="Category image"
            bucket="brand-assets"
            value={imageUrl}
            onChange={setImageUrl}
            aspectClassName="aspect-[3/4] h-auto w-40"
          />
          <Input
            label="Name"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
          />
          <Input
            label="Slug"
            required
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
          />
          <div>
            <label className="mb-1.5 block text-caption text-ink-muted">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-black/10 p-4 text-body text-ink outline-none focus:border-accent"
            />
          </div>
          <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
            Save Category
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleting)}
        title="Delete category"
        description={`Are you sure you want to delete "${deleting?.name}"? Products in this category will become uncategorized.`}
        isConfirming={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
