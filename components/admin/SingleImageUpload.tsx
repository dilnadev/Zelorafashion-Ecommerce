"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/providers/ToastProvider";
import { cn } from "@/lib/utils";

interface SingleImageUploadProps {
  label: string;
  bucket: string;
  value: string | null;
  onChange: (url: string | null) => void;
  aspectClassName?: string;
}

export function SingleImageUpload({ label, bucket, value, onChange, aspectClassName }: SingleImageUploadProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setIsUploading(true);
    const supabase = createClient();
    const path = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    setIsUploading(false);

    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "error" });
      return;
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    onChange(data.publicUrl);
  }

  return (
    <div>
      <p className="mb-1.5 text-caption normal-case tracking-normal text-ink-muted">{label}</p>
      <div
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-black/15 bg-black/[0.02] hover:border-black/25",
          aspectClassName ?? "h-28 w-full max-w-xs"
        )}
      >
        {value ? (
          <Image src={value} alt={label} fill className="object-contain p-2" sizes="300px" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-ink-muted">
            <Upload className="h-5 w-5" />
            <span className="text-caption normal-case tracking-normal">{isUploading ? "Uploading…" : "Upload image"}</span>
          </div>
        )}
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            aria-label="Remove image"
            className="absolute right-2 top-2 cursor-pointer rounded-full bg-white p-1 text-ink-muted shadow-card hover:text-destructive"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>
    </div>
  );
}
