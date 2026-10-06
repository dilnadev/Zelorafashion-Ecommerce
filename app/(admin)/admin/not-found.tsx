import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="font-serif text-hero text-ink">404</p>
      <h1 className="font-serif text-section text-ink">Not found</h1>
      <p className="max-w-md text-body text-ink-muted">
        This record doesn&apos;t exist or may have been deleted.
      </p>
      <Link
        href="/admin"
        className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-ink px-6 text-body font-medium text-white transition-colors hover:bg-charcoal"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
