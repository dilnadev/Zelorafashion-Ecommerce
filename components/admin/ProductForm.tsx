"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { TagInput } from "@/components/admin/TagInput";
import { ImageUploadZone } from "@/components/admin/ImageUploadZone";
import { VariantBuilder } from "@/components/admin/VariantBuilder";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/providers/ToastProvider";
import { slugify } from "@/lib/utils";
import {
  updateProduct,
  deleteProduct,
  type OptionInput,
  type VariantInput,
} from "@/app/(admin)/admin/products/actions";
import type { AdminProductDetail } from "@/lib/queries/admin-products";
import type { Category } from "@/types";

const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), {
  ssr: false,
  loading: () => <Skeleton height={160} />,
});

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}

export function ProductForm({
  detail,
  categories,
}: {
  detail: AdminProductDetail;
  categories: Category[];
}) {
  const { product, images, options: initialOptions, variants: initialVariants } = detail;
  const { toast } = useToast();
  const router = useRouter();

  const [title, setTitle] = useState(product.title);
  const [slug, setSlug] = useState(product.slug);
  const [slugTouched, setSlugTouched] = useState(true);
  const [description, setDescription] = useState(product.description ?? "");
  const [categoryId, setCategoryId] = useState(product.category_id ?? "");
  const [tags, setTags] = useState<string[]>(product.tags ?? []);
  const [price, setPrice] = useState(String(product.price));
  const [salePrice, setSalePrice] = useState(product.sale_price != null ? String(product.sale_price) : "");
  const [saleStart, setSaleStart] = useState(toDatetimeLocal(product.sale_start));
  const [saleEnd, setSaleEnd] = useState(toDatetimeLocal(product.sale_end));
  const [sku, setSku] = useState(product.sku);
  const [stockQuantity, setStockQuantity] = useState(String(product.stock_quantity));
  const [trackInventory, setTrackInventory] = useState(product.track_inventory);
  const [allowBackorders, setAllowBackorders] = useState(product.allow_backorders);
  const [metaTitle, setMetaTitle] = useState(product.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(product.meta_description ?? "");
  const [ogImageUrl, setOgImageUrl] = useState(product.og_image_url ?? "");
  const [status, setStatus] = useState(product.status);

  const [options, setOptions] = useState<OptionInput[]>(
    initialOptions.map((o) => ({ name: o.name, values: o.values.map((v) => v.value) }))
  );
  const [variants, setVariants] = useState<VariantInput[]>(
    initialVariants.map((v) => ({
      optionValues: v.option_values as { option_name: string; value: string }[],
      sku: v.sku,
      price: v.price,
      stockQuantity: v.stock_quantity,
    }))
  );

  const [savingStatus, setSavingStatus] = useState<"draft" | "active" | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const featuredImage = useMemo(() => images[0]?.image_url ?? null, [images]);

  async function handleSave(nextStatus: "draft" | "active") {
    setSavingStatus(nextStatus);

    const result = await updateProduct(product.id, {
      title,
      slug: slug || slugify(title),
      description,
      categoryId: categoryId || null,
      tags,
      price: Number(price) || 0,
      salePrice: salePrice === "" ? null : Number(salePrice),
      saleStart: fromDatetimeLocal(saleStart),
      saleEnd: fromDatetimeLocal(saleEnd),
      sku,
      stockQuantity: Number(stockQuantity) || 0,
      trackInventory,
      allowBackorders,
      status: nextStatus,
      metaTitle,
      metaDescription,
      ogImageUrl: ogImageUrl || featuredImage,
      options: options.filter((o) => o.name && o.values.length > 0),
      variants,
    });

    setSavingStatus(null);

    if (!result.success) {
      toast({ title: "Couldn't save product", description: result.message, variant: "error" });
      return;
    }

    setStatus(nextStatus);
    toast({
      title: nextStatus === "active" ? "Product published" : "Draft saved",
      variant: "success",
    });
    router.refresh();
  }

  async function handleDelete() {
    setIsDeleting(true);
    const result = await deleteProduct(product.id);
    setIsDeleting(false);

    if (!result.success) {
      toast({ title: "Couldn't delete product", description: result.message, variant: "error" });
      return;
    }
    toast({ title: "Product deleted", variant: "success" });
    router.push("/admin/products");
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-section text-ink">{title || "Edit Product"}</h1>
        <span
          className={
            status === "active"
              ? "rounded-full bg-green-50 px-3 py-1 text-caption normal-case tracking-normal text-green-700"
              : "rounded-full bg-black/[0.06] px-3 py-1 text-caption normal-case tracking-normal text-ink-muted"
          }
        >
          {status === "active" ? "Active" : "Draft"}
        </span>
      </div>

      <div className="space-y-10">
        <section className="space-y-4">
          <h2 className="text-body-lg text-ink">Basic Information</h2>
          <Input
            label="Title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
          />
          <Input
            label="Slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
          />
          <div>
            <label className="mb-1.5 block text-caption text-ink-muted">Description</label>
            <RichTextEditor value={description} onChange={setDescription} />
          </div>
          <div>
            <label className="mb-1.5 block text-caption text-ink-muted">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-12 w-full rounded-xl border border-black/10 px-4 text-body text-ink outline-none focus:border-accent"
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-caption text-ink-muted">Tags</label>
            <TagInput value={tags} onChange={setTags} />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-body-lg text-ink">Pricing</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Regular price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
            <Input
              label="Sale price (optional)"
              type="number"
              step="0.01"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
            />
          </div>
          {salePrice !== "" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-caption text-ink-muted">Sale start</label>
                <input
                  type="datetime-local"
                  value={saleStart}
                  onChange={(e) => setSaleStart(e.target.value)}
                  className="h-12 w-full rounded-xl border border-black/10 px-4 text-body text-ink outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-caption text-ink-muted">Sale end</label>
                <input
                  type="datetime-local"
                  value={saleEnd}
                  onChange={(e) => setSaleEnd(e.target.value)}
                  className="h-12 w-full rounded-xl border border-black/10 px-4 text-body text-ink outline-none focus:border-accent"
                />
              </div>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-body-lg text-ink">Inventory</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="SKU" value={sku} onChange={(e) => setSku(e.target.value)} />
            <Input
              label="Stock quantity"
              type="number"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2.5 text-body text-ink">
            <input
              type="checkbox"
              checked={trackInventory}
              onChange={(e) => setTrackInventory(e.target.checked)}
              className="h-4 w-4 cursor-pointer rounded border-black/20 text-accent"
            />
            Track inventory
          </label>
          <label className="flex cursor-pointer items-center gap-2.5 text-body text-ink">
            <input
              type="checkbox"
              checked={allowBackorders}
              onChange={(e) => setAllowBackorders(e.target.checked)}
              className="h-4 w-4 cursor-pointer rounded border-black/20 text-accent"
            />
            Allow backorders
          </label>
        </section>

        <section className="space-y-4">
          <h2 className="text-body-lg text-ink">Media</h2>
          <ImageUploadZone productId={product.id} initialImages={images} />
        </section>

        <section className="space-y-4">
          <h2 className="text-body-lg text-ink">Variants</h2>
          <p className="text-caption normal-case tracking-normal text-ink-muted">
            Add option groups like Color or Size — variant rows are generated automatically.
          </p>
          <VariantBuilder
            options={options}
            variants={variants}
            baseSku={sku}
            onChange={(nextOptions, nextVariants) => {
              setOptions(nextOptions);
              setVariants(nextVariants);
            }}
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-body-lg text-ink">SEO</h2>
          <Input label="Meta title" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
          <div>
            <label className="mb-1.5 block text-caption text-ink-muted">Meta description</label>
            <textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-black/10 p-4 text-body text-ink outline-none focus:border-accent"
            />
          </div>
          <Input
            label="OG image URL (defaults to featured image)"
            value={ogImageUrl}
            onChange={(e) => setOgImageUrl(e.target.value)}
          />
        </section>

        <div className="flex items-center justify-between border-t border-black/[0.06] pt-6">
          <Button variant="ghost" onClick={() => setShowDeleteConfirm(true)} className="text-destructive">
            Delete Product
          </Button>
          <div className="flex gap-3">
            <Button variant="secondary" isLoading={savingStatus === "draft"} onClick={() => handleSave("draft")}>
              Save as Draft
            </Button>
            <Button isLoading={savingStatus === "active"} onClick={() => handleSave("active")}>
              Publish
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete product"
        description="This will permanently delete this product, its images, and its variants."
        isConfirming={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
