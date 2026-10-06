"use client";

import { useRef, useState, type DragEvent } from "react";
import Image from "next/image";
import { GripVertical, Star, Trash2, Upload } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/providers/ToastProvider";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  addProductImage,
  deleteProductImage,
  reorderProductImages,
} from "@/app/(admin)/admin/products/actions";
import type { ProductImage } from "@/types";

const MAX_IMAGES = 10;

export function ImageUploadZone({
  productId,
  initialImages,
}: {
  productId: string;
  initialImages: ProductImage[];
}) {
  const { toast } = useToast();
  const [images, setImages] = useState(initialImages);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [deleting, setDeleting] = useState<ProductImage | null>(null);
  const dragIndexRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFiles(files: FileList | File[]) {
    const remaining = MAX_IMAGES - images.length;
    const list = Array.from(files).slice(0, remaining);
    if (list.length === 0) return;

    setIsUploading(true);
    const supabase = createClient();

    for (const file of list) {
      const path = `${productId}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const { error: uploadErr } = await supabase.storage.from("product-images").upload(path, file);
      if (uploadErr) {
        toast({ title: "Upload failed", description: uploadErr.message, variant: "error" });
        continue;
      }
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      const result = await addProductImage(productId, data.publicUrl, images.length);
      if (result.success) {
        setImages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            product_id: productId,
            image_url: data.publicUrl,
            sort_order: prev.length,
            alt_text: null,
          },
        ]);
      }
    }
    setIsUploading(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    const result = await deleteProductImage(deleting.id, productId);
    if (result.success) {
      setImages((prev) => prev.filter((img) => img.id !== deleting.id));
      toast({ title: "Image removed", variant: "success" });
    } else {
      toast({ title: "Couldn't remove image", variant: "error" });
    }
    setDeleting(null);
  }

  function handleDragStart(index: number) {
    dragIndexRef.current = index;
  }

  function handleDragOverImage(e: DragEvent<HTMLDivElement>, index: number) {
    e.preventDefault();
    const fromIndex = dragIndexRef.current;
    if (fromIndex === null || fromIndex === index) return;

    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    dragIndexRef.current = index;
  }

  async function handleDragEnd() {
    dragIndexRef.current = null;
    await reorderProductImages(
      productId,
      images.map((img) => img.id)
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors",
          isDragOver ? "border-accent bg-accent/5" : "border-black/15 hover:border-black/25"
        )}
      >
        <Upload className="h-6 w-6 text-ink-muted" />
        <p className="text-body text-ink">Drag images here, or click to browse</p>
        <p className="text-caption normal-case tracking-normal text-ink-muted">
          Up to {MAX_IMAGES} images. First image is the featured image.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
      </div>

      {isUploading && <p className="mt-2 text-caption normal-case tracking-normal text-ink-muted">Uploading…</p>}

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {images.map((image, index) => (
            <div
              key={image.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOverImage(e, index)}
              onDragEnd={handleDragEnd}
              className="group relative aspect-square cursor-grab overflow-hidden rounded-xl border border-black/[0.06] bg-black/[0.03] active:cursor-grabbing"
            >
              <Image src={image.image_url} alt="" fill className="object-cover" sizes="120px" />
              {index === 0 && (
                <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 text-[10px] text-white">
                  <Star className="h-2.5 w-2.5 fill-current" /> Featured
                </span>
              )}
              <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => setDeleting(image)}
                  aria-label="Remove image"
                  className="cursor-pointer rounded-full bg-white p-1 text-destructive shadow-card"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
              <div className="absolute bottom-1.5 right-1.5 rounded-full bg-white/90 p-1 text-ink-muted opacity-0 transition-opacity group-hover:opacity-100">
                <GripVertical className="h-3 w-3" />
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleting)}
        title="Remove image"
        description="This image will be permanently removed from the product."
        confirmLabel="Remove"
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
