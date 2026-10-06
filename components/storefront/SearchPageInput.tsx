"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function SearchPageInput({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
  }

  return (
    <form onSubmit={handleSubmit} className="relative mb-10 max-w-xl">
      <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search products…"
        className="h-14 w-full rounded border border-ink/15 bg-white pl-14 pr-6 text-body text-ink outline-none focus:border-accent"
      />
    </form>
  );
}
