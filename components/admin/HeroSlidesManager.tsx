"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SingleImageUpload } from "@/components/admin/SingleImageUpload";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/providers/ToastProvider";
import {
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  reorderHeroSlides,
  type HeroSlideInput,
} from "@/app/(admin)/admin/settings/actions";
import type { HeroSlide } from "@/types";

const EMPTY_FORM: HeroSlideInput = {
  imageUrl: "",
  heading: "",
  subheading: "",
  ctaText: "",
  ctaLink: "",
  isActive: true,
};

export function HeroSlidesManager({ initialSlides }: { initialSlides: HeroSlide[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [slides, setSlides] = useState(initialSlides);

  useEffect(() => {
    setSlides(initialSlides);
  }, [initialSlides]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [deleting, setDeleting] = useState<HeroSlide | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [form, setForm] = useState<HeroSlideInput>(EMPTY_FORM);
  const dragIndexRef = useRef<number | null>(null);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  }

  function openEdit(slide: HeroSlide) {
    setEditing(slide);
    setForm({
      imageUrl: slide.image_url,
      heading: slide.heading,
      subheading: slide.subheading ?? "",
      ctaText: slide.cta_text ?? "",
      ctaLink: slide.cta_link ?? "",
      isActive: slide.is_active,
    });
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    const result = editing ? await updateHeroSlide(editing.id, form) : await createHeroSlide(form);
    setIsSubmitting(false);

    if (!result.success) {
      toast({ title: "Something went wrong", description: result.message, variant: "error" });
      return;
    }
    toast({ title: editing ? "Slide updated" : "Slide created", variant: "success" });
    setIsModalOpen(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!deleting) return;
    setIsDeleting(true);
    const result = await deleteHeroSlide(deleting.id);
    setIsDeleting(false);

    if (!result.success) {
      toast({ title: "Couldn't delete slide", description: result.message, variant: "error" });
      return;
    }
    toast({ title: "Slide deleted", variant: "success" });
    setSlides((prev) => prev.filter((s) => s.id !== deleting.id));
    setDeleting(null);
    router.refresh();
  }

  function handleDragStart(index: number) {
    dragIndexRef.current = index;
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>, index: number) {
    e.preventDefault();
    const fromIndex = dragIndexRef.current;
    if (fromIndex === null || fromIndex === index) return;
    setSlides((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    dragIndexRef.current = index;
  }

  async function handleDragEnd() {
    dragIndexRef.current = null;
    await reorderHeroSlides(slides.map((s) => s.id));
    router.refresh();
  }

  return (
    <section className="rounded-2xl border border-black/[0.06] bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-lg text-ink">Homepage Hero Slides</h2>
          <p className="text-caption normal-case tracking-normal text-ink-muted">Drag to reorder.</p>
        </div>
        <Button size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={openAdd}>
          Add Slide
        </Button>
      </div>

      {slides.length === 0 ? (
        <p className="text-body text-ink-muted">No hero slides yet.</p>
      ) : (
        <div className="space-y-3">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className="flex cursor-grab items-center gap-4 rounded-xl border border-black/[0.06] p-3 active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4 shrink-0 text-ink-muted" />
              <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-black/[0.04]">
                <Image src={slide.image_url} alt={slide.heading} fill className="object-cover" sizes="96px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-body text-ink">{slide.heading}</p>
                <p className="truncate text-caption normal-case tracking-normal text-ink-muted">
                  {slide.subheading}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-caption normal-case tracking-normal ${
                  slide.is_active ? "bg-green-50 text-green-700" : "bg-black/[0.06] text-ink-muted"
                }`}
              >
                {slide.is_active ? "Active" : "Inactive"}
              </span>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(slide)}
                  aria-label={`Edit ${slide.heading}`}
                  className="cursor-pointer rounded-full p-1.5 text-ink-muted transition-colors hover:bg-black/[0.04] hover:text-ink"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting(slide)}
                  aria-label={`Delete ${slide.heading}`}
                  className="cursor-pointer rounded-full p-1.5 text-ink-muted transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? "Edit Slide" : "Add Slide"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <SingleImageUpload
            label="Slide image"
            bucket="brand-assets"
            value={form.imageUrl || null}
            onChange={(url) => setForm({ ...form, imageUrl: url ?? "" })}
            aspectClassName="h-40 w-full max-w-full"
          />
          <Input label="Heading" required value={form.heading} onChange={(e) => setForm({ ...form, heading: e.target.value })} />
          <Input
            label="Subheading"
            value={form.subheading}
            onChange={(e) => setForm({ ...form, subheading: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="CTA text" value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} />
            <Input label="CTA link" value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-body text-ink">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-4 w-4 cursor-pointer rounded border-black/20"
            />
            Active
          </label>
          <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
            Save Slide
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleting)}
        title="Delete slide"
        description={`Are you sure you want to delete "${deleting?.heading}"?`}
        isConfirming={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
    </section>
  );
}
