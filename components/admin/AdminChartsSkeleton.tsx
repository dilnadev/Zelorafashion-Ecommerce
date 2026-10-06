import { Skeleton } from "@/components/ui/Skeleton";

export function AdminChartsSkeleton({ charts = 5 }: { charts?: number }) {
  return (
    <div>
      <Skeleton variant="text" width={160} height={32} className="mb-8" />
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: charts }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-black/[0.06] bg-white p-5">
            <Skeleton variant="text" width={140} height={20} className="mb-4" />
            <Skeleton height={256} className="w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
