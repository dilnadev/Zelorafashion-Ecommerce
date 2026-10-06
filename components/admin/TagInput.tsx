"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";

export function TagInput({ value, onChange }: { value: string[]; onChange: (tags: string[]) => void }) {
  const [draft, setDraft] = useState("");

  function commitTag() {
    const tag = draft.trim();
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setDraft("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitTag();
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-black/10 p-2 focus-within:border-accent">
      {value.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1.5 rounded-full bg-black/[0.06] px-3 py-1 text-caption normal-case tracking-normal text-ink"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            aria-label={`Remove ${tag}`}
            className="cursor-pointer text-ink-muted hover:text-destructive"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitTag}
        placeholder={value.length === 0 ? "Add tags, press Enter" : ""}
        className="min-w-[100px] flex-1 border-none px-2 py-1 text-body text-ink outline-none"
      />
    </div>
  );
}
