"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import { createClient } from "@/lib/supabase/client";

export function PasswordChangeForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirmPassword") ?? "");

    if (password.length < 6) {
      toast({ title: "Password too short", description: "Use at least 6 characters.", variant: "error" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Passwords don't match", variant: "error" });
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setIsSubmitting(false);

    if (error) {
      toast({ title: "Couldn't update password", description: error.message, variant: "error" });
      return;
    }

    toast({ title: "Password updated", variant: "success" });
    (document.getElementById("password-change-form") as HTMLFormElement)?.reset();
  }

  return (
    <form id="password-change-form" onSubmit={handleSubmit} className="space-y-4">
      <Input label="New password" name="password" type="password" required minLength={6} />
      <Input label="Confirm new password" name="confirmPassword" type="password" required minLength={6} />
      <Button type="submit" isLoading={isSubmitting}>
        Update Password
      </Button>
    </form>
  );
}
