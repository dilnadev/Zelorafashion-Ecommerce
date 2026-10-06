import { Skeleton } from "@/components/ui/Skeleton";

export function AdminDetailSkeleton() {
  return (
    <div>
      <Skeleton variant="text" width={140} height={16} className="mb-4" />
      <Skeleton variant="text" width={280} height={32} className="mb-8" />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-black/[0.06] bg-white p-6">
              <Skeleton variant="text" width={160} height={20} className="mb-4" />
              <Skeleton variant="text" width="90%" className="mb-2" />
              <Skeleton variant="text" width="70%" />
            </div>
          ))}
        </div>
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-black/[0.06] bg-white p-6">
              <Skeleton variant="text" width={120} height={20} className="mb-4" />
              <Skeleton height={40} className="w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
