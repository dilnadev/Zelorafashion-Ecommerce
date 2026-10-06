"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

export function ProfileSettingsForm({ profile }: { profile: Profile }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const fullName = String(formData.get("fullName") ?? "");
    const phone = String(formData.get("phone") ?? "");

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone: phone || null })
      .eq("id", profile.id);

    setIsSubmitting(false);
    toast({
      title: error ? "Couldn't update profile" : "Profile updated",
      variant: error ? "error" : "success",
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Full name" name="fullName" defaultValue={profile.full_name ?? ""} />
      <Input label="Phone" name="phone" defaultValue={profile.phone ?? ""} />
      <Input label="Email" value={profile.email} disabled />
      <Button type="submit" isLoading={isSubmitting}>
        Save Changes
      </Button>
    </form>
  );
}
