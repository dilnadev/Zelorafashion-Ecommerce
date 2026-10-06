"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function StorefrontError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-content flex-col items-center justify-center gap-4 px-6 text-center md:px-16">
      <h1 className="font-serif text-section text-ink">Something went wrong</h1>
      <p className="max-w-md text-body text-ink-muted">
        We hit an unexpected error loading this page. Please try again.
      </p>
      <div className="mt-2 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-12 cursor-pointer items-center justify-center rounded bg-ink px-6 text-caption uppercase tracking-[0.12em] text-white transition-colors hover:bg-charcoal"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center rounded border border-black/10 px-6 text-caption uppercase tracking-[0.12em] text-ink transition-colors hover:bg-black/[0.03]"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
