"use client";

import { useState } from "react";
import { Search, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/providers/ToastProvider";

export default function UiPreviewPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  return (
    <main className="mx-auto max-w-content px-6 py-16 md:px-16">
      <h1 className="mb-2 font-serif text-hero text-ink">Design System</h1>
      <p className="mb-16 text-body text-ink-muted">
        Phase 1 smoke test — every primitive component and its animation, with
        no backend connection required.
      </p>

      <section className="mb-16 space-y-6">
        <h2 className="text-section font-serif text-ink">Buttons</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="primary" isLoading>
            Loading
          </Button>
          <Button variant="primary" leftIcon={<Search className="h-4 w-4" />}>
            With icon
          </Button>
        </div>
      </section>

      <section className="mb-16 max-w-md space-y-6">
        <h2 className="text-section font-serif text-ink">Inputs</h2>
        <Input label="Email address" leftIcon={<Mail className="h-4 w-4" />} />
        <Input label="Full name" defaultValue="Ada Lovelace" />
        <Input label="Coupon code" error="This code has expired" />
      </section>

      <section className="mb-16 space-y-6">
        <h2 className="text-section font-serif text-ink">Modal</h2>
        <Button onClick={() => setIsModalOpen(true)}>Open modal</Button>
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Confirm action"
        >
          <p className="text-body text-ink-muted">
            This is a modal dialog with scale + fade entrance, backdrop blur,
            focus trap, and Esc / click-outside dismissal.
          </p>
          <div className="mt-8 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>
              Confirm
            </Button>
          </div>
        </Modal>
      </section>

      <section className="mb-16 space-y-6">
        <h2 className="text-section font-serif text-ink">Toasts</h2>
        <div className="flex flex-wrap gap-4">
          <Button
            variant="secondary"
            onClick={() =>
              toast({
                title: "Added to cart",
                description: "Linen Shirt — Size M",
                variant: "success",
              })
            }
          >
            Success toast
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast({
                title: "Something went wrong",
                description: "Please try again.",
                variant: "error",
              })
            }
          >
            Error toast
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast({ title: "Heads up", description: "Sale ends tonight." })
            }
          >
            Info toast
          </Button>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-section font-serif text-ink">Skeletons</h2>
        <div className="grid grid-cols-4 gap-6">
          <div className="space-y-3">
            <Skeleton height={240} />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="40%" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton variant="circle" width={48} height={48} />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" />
              <Skeleton variant="text" width="60%" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
