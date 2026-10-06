"use client";

import { useRef, useState, type FormEvent } from "react";
import { submitContactMessage } from "@/app/(storefront)/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/providers/ToastProvider";

export function ContactForm() {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const result = await submitContactMessage(null, formData);
    setIsSubmitting(false);

    toast({
      title: result.success ? "Message sent" : "Couldn't send message",
      description: result.message,
      variant: result.success ? "success" : "error",
    });
    if (result.success) formRef.current?.reset();
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Your name" name="name" required />
        <Input label="Email address" name="email" type="email" required />
      </div>
      <Input label="Subject" name="subject" />
      <div className="flex flex-col gap-1.5">
        <textarea
          name="message"
          required
          rows={6}
          placeholder="Your message"
          className="w-full rounded border border-ink/15 bg-white px-4 py-3.5 text-body text-ink outline-none transition-colors focus:border-accent"
        />
      </div>
      <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full sm:w-auto">
        Send Message
      </Button>
    </form>
  );
}
