import { Skeleton } from "@/components/ui/Skeleton";

export default function AdminDashboardLoading() {
  return (
    <div>
      <Skeleton variant="text" width={160} height={32} className="mb-8" />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-black/[0.06] bg-white p-5">
            <Skeleton variant="text" width={100} height={14} className="mb-3" />
            <Skeleton variant="text" width={90} height={28} />
          </div>
        ))}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-black/[0.06] bg-white p-5 lg:col-span-2">
          <Skeleton variant="text" width={100} height={20} className="mb-4" />
          <Skeleton height={256} className="w-full" />
        </div>
        <div className="rounded-2xl border border-black/[0.06] bg-white p-5">
          <Skeleton variant="text" width={140} height={20} className="mb-4" />
          <Skeleton height={256} className="w-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-black/[0.06] bg-white p-5 lg:col-span-2">
          <Skeleton variant="text" width={140} height={20} className="mb-4" />
          <Skeleton height={200} className="w-full" />
        </div>
        <div className="rounded-2xl border border-black/[0.06] bg-white p-5">
          <Skeleton variant="text" width={120} height={20} className="mb-4" />
          <Skeleton height={200} className="w-full" />
        </div>
      </div>
    </div>
  );
}
