"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { subscribeToNewsletter } from "@/app/(storefront)/actions";
import { useToast } from "@/components/providers/ToastProvider";

const DISMISS_KEY = "newsletter-popup-dismissed";
const SHOW_DELAY_MS = 1500;

export function NewsletterPopup() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem(DISMISS_KEY)) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
      localStorage.setItem(DISMISS_KEY, "1");
    }, SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    dialogRef.current?.focus();
    document.body.style.overflow = "hidden";

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  function close(persistDismiss = dontShowAgain) {
    setIsOpen(false);
    if (persistDismiss) localStorage.setItem(DISMISS_KEY, "1");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const result = await subscribeToNewsletter(null, formData);
    setIsSubmitting(false);

    toast({
      title: result.success ? "Subscribed" : "Couldn't subscribe",
      description: result.message,
      variant: result.success ? "success" : "error",
    });

    if (result.success) close(true);
  }

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => close()}
            aria-hidden="true"
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Newsletter signup"
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative z-10 grid w-full max-w-3xl grid-cols-1 overflow-hidden bg-white shadow-card outline-none md:grid-cols-2"
          >
            <button
              type="button"
              onClick={() => close()}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 cursor-pointer rounded-full bg-white/80 p-1.5 text-ink transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:bg-transparent md:hover:bg-black/[0.04]"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative order-1 aspect-[4/3] md:aspect-auto">
              <Image
                src="https://dlnpvbfottgzplbincbz.supabase.co/storage/v1/object/public/media-library/1791183314339-ChatGPT-Image-Oct-2,-2026,-11_27_16-AM-(1).png"
                alt="New arrivals"
                fill
                className="object-cover"
                sizes="(min-width: 768px) 384px, 100vw"
              />
            </div>

            <div className="order-2 flex flex-col justify-center gap-5 p-8 md:p-10">
              <h2 className="font-serif text-2xl leading-snug text-ink md:text-3xl">
                Be the first to know about new arrivals &amp; offers.
              </h2>
              <p className="text-body text-ink-muted">
                Subscribe to our newsletter for early access to new collections and exclusive updates.
              </p>
              <form onSubmit={handleSubmit} className="flex items-stretch border border-black/15">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Enter your email"
                  className="h-14 flex-1 bg-transparent px-5 text-body text-ink outline-none placeholder:text-ink-muted"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  aria-label="Subscribe"
                  className="flex w-14 shrink-0 cursor-pointer items-center justify-center border-l border-black/15 text-ink transition-colors hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
              <label className="flex cursor-pointer items-center gap-2 text-caption normal-case tracking-normal text-ink-muted">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded border-black/20"
                />
                Do not show this pop-up again
              </label>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
