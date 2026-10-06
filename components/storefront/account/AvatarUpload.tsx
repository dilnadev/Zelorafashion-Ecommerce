"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import { createClient } from "@/lib/supabase/client";

export function AvatarUpload({
  userId,
  initialAvatarUrl,
}: {
  userId: string;
  initialAvatarUrl: string | null;
}) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setIsUploading(false);
      toast({ title: "Upload failed", description: uploadError.message, variant: "error" });
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", userId);

    setIsUploading(false);

    if (updateError) {
      toast({ title: "Couldn't save avatar", variant: "error" });
      return;
    }

    setAvatarUrl(publicUrl);
    toast({ title: "Avatar updated", variant: "success" });
  }

  return (
    <div className="flex items-center gap-5">
      <div className="relative h-20 w-20 overflow-hidden rounded-full bg-black/[0.04]">
        {avatarUrl && <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />}
      </div>
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="flex cursor-pointer items-center gap-2 rounded border border-ink/15 px-4 py-2 text-body text-ink transition-colors hover:border-ink/30 disabled:opacity-50"
        >
          <Camera className="h-4 w-4" />
          {isUploading ? "Uploading..." : "Change photo"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
