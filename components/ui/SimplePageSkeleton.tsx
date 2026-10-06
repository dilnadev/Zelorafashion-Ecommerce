import { Skeleton } from "@/components/ui/Skeleton";

export function SimplePageSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="mx-auto max-w-content px-6 py-10 md:px-16">
      <Skeleton variant="text" width={220} height={32} className="mb-8" />
      <div className="space-y-4">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} height={64} className="w-full" />
        ))}
      </div>
    </div>
  );
}
