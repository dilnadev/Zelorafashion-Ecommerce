"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import { createDraftProduct } from "@/app/(admin)/admin/products/actions";

export default function NewProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await createDraftProduct(title);
    setIsSubmitting(false);

    if (!result.success || !result.id) {
      toast({ title: "Couldn't create product", description: result.message, variant: "error" });
      return;
    }

    toast({ title: "Product created", description: "Continue editing the details below.", variant: "success" });
    router.push(`/admin/products/${result.id}`);
  }

  return (
    <div className="max-w-md">
      <h1 className="mb-8 font-serif text-section text-ink">New Product</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Product title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <p className="text-caption normal-case tracking-normal text-ink-muted">
          You&apos;ll add pricing, images, and variants on the next screen. The product starts as a draft.
        </p>
        <Button type="submit" size="lg" isLoading={isSubmitting}>
          Create Product
        </Button>
      </form>
    </div>
  );
}
