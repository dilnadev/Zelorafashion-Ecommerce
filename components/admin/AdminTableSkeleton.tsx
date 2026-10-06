import { Skeleton } from "@/components/ui/Skeleton";

export function AdminTableSkeleton({ rows = 8, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div>
      <Skeleton variant="text" width={220} height={36} className="mb-8" />
      <Skeleton width={280} height={40} className="mb-6 rounded-full" />
      <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
        <div className="border-b border-black/[0.06] bg-black/[0.02] px-5 py-3">
          <Skeleton variant="text" width="100%" height={14} />
        </div>
        <div className="divide-y divide-black/[0.06]">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-6 px-5 py-4">
              {Array.from({ length: columns }).map((_, j) => (
                <Skeleton key={j} variant="text" width={j === 0 ? "20%" : "12%"} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
