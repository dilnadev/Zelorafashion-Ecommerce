import { Skeleton } from "@/components/ui/Skeleton";

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-[3/4] w-full" />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="40%" />
        </div>
      ))}
    </div>
  );
}
