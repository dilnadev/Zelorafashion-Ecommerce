"use client";

import { useRef, useState, type DragEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Copy, Search, Trash2, Upload } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/providers/ToastProvider";
import { createClient } from "@/lib/supabase/client";
import { cn, formatDate } from "@/lib/utils";
import { recordMediaUpload, checkMediaUsage, deleteMedia } from "@/app/(admin)/admin/media/actions";
import type { MediaAsset } from "@/types";

export function MediaLibrary({ initialMedia }: { initialMedia: MediaAsset[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [media, setMedia] = useState(initialMedia);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<MediaAsset | null>(null);
  const [deleteWarning, setDeleteWarning] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFiles(files: FileList | File[]) {
    setIsUploading(true);
    const supabase = createClient();

    for (const file of Array.from(files)) {
      const path = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const { error: uploadErr } = await supabase.storage.from("media-library").upload(path, file);
      if (uploadErr) {
        toast({ title: "Upload failed", description: uploadErr.message, variant: "error" });
        continue;
      }
      const { data } = supabase.storage.from("media-library").getPublicUrl(path);
      const result = await recordMediaUpload({
        url: data.publicUrl,
        filename: file.name,
        size: file.size,
        mimeType: file.type,
      });
      if (result.success) {
        setMedia((prev) => [
          {
            id: crypto.randomUUID(),
            url: data.publicUrl,
            filename: file.name,
            size: file.size,
            mime_type: file.type,
            uploaded_by: null,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    }
    setIsUploading(false);
    router.refresh();
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files);
  }

  async function openDeleteConfirm(asset: MediaAsset) {
    setDeleting(asset);
    setDeleteWarning(null);
    const usage = await checkMediaUsage(asset.url);
    const notes: string[] = [];
    if (usage.usedByProducts.length > 0) notes.push(`used by product(s): ${usage.usedByProducts.join(", ")}`);
    if (usage.usedByHeroSlides) notes.push("used by a homepage hero slide");
    if (notes.length > 0) setDeleteWarning(`Warning: this image is currently ${notes.join(" and ")}.`);
  }

  async function handleDelete() {
    if (!deleting) return;
    setIsDeleting(true);
    const result = await deleteMedia(deleting.id, deleting.url);
    setIsDeleting(false);

    if (!result.success) {
      toast({ title: "Couldn't delete media", description: result.message, variant: "error" });
      return;
    }
    toast({ title: "Media deleted", variant: "success" });
    setMedia((prev) => prev.filter((m) => m.id !== deleting.id));
    setDeleting(null);
    router.refresh();
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    toast({ title: "URL copied", variant: "success" });
  }

  const filtered = media.filter((m) => m.filename.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-section text-ink">Media Library</h1>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by filename"
            className="h-10 w-full rounded-full border border-black/10 bg-white pl-9 pr-4 text-body text-ink outline-none focus:border-accent"
          />
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "mb-8 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-10 text-center transition-colors",
          isDragOver ? "border-accent bg-accent/5" : "border-black/15 hover:border-black/25"
        )}
      >
        <Upload className="h-6 w-6 text-ink-muted" />
        <p className="text-body text-ink">{isUploading ? "Uploading…" : "Drag images here, or click to browse"}</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-body text-ink-muted">No media uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6">
          {filtered.map((asset) => (
            <div
              key={asset.id}
              className="group relative overflow-hidden rounded-xl border border-black/[0.06] bg-black/[0.02]"
            >
              <div className="relative aspect-square">
                <Image src={asset.url} alt={asset.filename} fill className="object-cover" sizes="200px" />
              </div>
              <div className="p-2">
                <p className="truncate text-caption normal-case tracking-normal text-ink-muted">{asset.filename}</p>
                <p className="text-caption normal-case tracking-normal text-ink-muted">{formatDate(asset.created_at)}</p>
              </div>
              <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => copyUrl(asset.url)}
                  aria-label="Copy URL"
                  className="cursor-pointer rounded-full bg-white p-1.5 text-ink-muted shadow-card hover:text-accent"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => openDeleteConfirm(asset)}
                  aria-label="Delete"
                  className="cursor-pointer rounded-full bg-white p-1.5 text-destructive shadow-card"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleting)}
        title="Delete media"
        description={deleteWarning ?? `Are you sure you want to delete "${deleting?.filename}"? This cannot be undone.`}
        confirmLabel="Delete"
        isConfirming={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
