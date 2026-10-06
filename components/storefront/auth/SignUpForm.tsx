"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import { createClient } from "@/lib/supabase/client";

export function SignUpForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const fullName = String(formData.get("fullName"));
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setIsSubmitting(false);

    if (error) {
      toast({ title: "Couldn't create account", description: error.message, variant: "error" });
      return;
    }

    if (!data.session) {
      toast({
        title: "Check your email",
        description: "Confirm your address to finish creating your account.",
        variant: "success",
      });
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input label="Full name" name="fullName" required />
      <Input label="Email address" name="email" type="email" required />
      <Input label="Password" name="password" type="password" required minLength={6} />
      <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
        Create Account
      </Button>
    </form>
  );
}
