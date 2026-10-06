import Link from "next/link";

export default function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
      <p className="font-serif text-hero text-ink">404</p>
      <h1 className="font-serif text-section text-ink">Page not found</h1>
      <p className="max-w-md text-body text-ink-muted">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex h-14 items-center justify-center rounded bg-ink px-8 text-caption uppercase tracking-[0.12em] text-white transition-colors hover:bg-charcoal"
      >
        Back to Home
      </Link>
    </div>
  );
}
