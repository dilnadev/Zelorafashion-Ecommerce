"use client";

import { useEffect } from "react";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="font-serif text-section text-ink">Something went wrong</h1>
      <p className="max-w-md text-body text-ink-muted">
        We hit an unexpected error loading this page. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-ink px-6 text-body font-medium text-white transition-colors hover:bg-charcoal"
      >
        Try Again
      </button>
    </div>
  );
}
