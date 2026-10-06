"use client";

import { useRef, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { subscribeToNewsletter } from "@/app/(storefront)/actions";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";

export function Newsletter() {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
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
    if (result.success) formRef.current?.reset();
  }

  return (
    <section className="bg-ink px-6 py-20 md:px-16 md:py-30">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-xl text-center"
      >
        <p className="mb-3 text-caption uppercase tracking-[0.12em] text-accent">Join Us</p>
        <h2 className="font-serif text-section text-white">Enter Our World</h2>
        <p className="mt-3 text-body text-white/70">
          New arrivals, considered edits, and early access to sales.
        </p>
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="mt-8 flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            name="email"
            required
            placeholder="Your email address"
            className="h-14 flex-1 rounded border border-white/20 bg-white/5 px-6 text-body text-white placeholder:text-white/50 outline-none focus:border-white/50"
          />
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="shrink-0 bg-white uppercase tracking-[0.1em] text-ink hover:bg-white/90"
          >
            Subscribe
          </Button>
        </form>
      </motion.div>
    </section>
  );
}
