"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ToastItem } from "@/components/providers/ToastProvider";

const variantConfig = {
  success: { icon: CheckCircle2, className: "text-success", barClassName: "bg-success" },
  error: { icon: XCircle, className: "text-destructive", barClassName: "bg-destructive" },
  info: { icon: Info, className: "text-ink", barClassName: "bg-ink" },
} as const;

interface ToastViewportProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  return (
    <div className="pointer-events-none fixed right-6 top-6 z-[100] flex w-full max-w-sm flex-col gap-3">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const { icon: Icon, className, barClassName } =
            variantConfig[toast.variant ?? "info"];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="pointer-events-auto relative overflow-hidden rounded border border-black/[0.06] bg-white p-4 pr-10 shadow-card"
            >
              <div className="flex items-start gap-3">
                <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", className)} />
                <div className="min-w-0">
                  <p className="text-body font-medium text-ink">
                    {toast.title}
                  </p>
                  {toast.description && (
                    <p className="mt-0.5 text-body text-ink-muted">
                      {toast.description}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                aria-label="Dismiss notification"
                className="absolute right-3 top-3 cursor-pointer text-ink-muted transition-colors hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
              <motion.div
                className={cn("absolute bottom-0 left-0 h-0.5", barClassName)}
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: (toast.duration ?? 3000) / 1000, ease: "linear" }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
