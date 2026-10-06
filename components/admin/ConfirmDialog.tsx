"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmVariant?: "destructive" | "primary";
  isConfirming?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Delete",
  confirmVariant = "destructive",
  isConfirming = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-body text-ink-muted">{description}</p>
      <div className="mt-8 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose} disabled={isConfirming}>
          Cancel
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm} isLoading={isConfirming}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
