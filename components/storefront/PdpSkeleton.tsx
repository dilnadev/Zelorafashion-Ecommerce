import { Skeleton } from "@/components/ui/Skeleton";

export function PdpSkeleton() {
  return (
    <div className="mx-auto max-w-content px-6 py-10 md:px-16">
      <Skeleton variant="text" width={240} height={16} className="mb-8" />
      <div className="grid gap-10 md:grid-cols-2">
        <Skeleton className="aspect-[3/4] w-full" />
        <div>
          <Skeleton variant="text" width="70%" height={36} className="mb-4" />
          <Skeleton variant="text" width={120} height={20} className="mb-6" />
          <Skeleton variant="text" width={100} height={28} className="mb-8" />
          <Skeleton height={56} className="mb-4 w-full rounded-full" />
          <Skeleton height={56} className="w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}
