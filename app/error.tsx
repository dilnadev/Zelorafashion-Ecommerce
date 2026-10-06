"use client";

import { useEffect } from "react";

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center font-sans">
        <h1 className="font-serif text-2xl text-ink">Something went wrong</h1>
        <p className="max-w-md text-body text-ink-muted">
          We hit an unexpected error. Please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-2 inline-flex h-12 cursor-pointer items-center justify-center rounded bg-ink px-6 text-caption uppercase tracking-[0.12em] text-white transition-colors hover:bg-charcoal"
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
