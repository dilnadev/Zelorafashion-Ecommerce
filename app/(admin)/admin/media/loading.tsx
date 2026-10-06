import { Skeleton } from "@/components/ui/Skeleton";

export default function AdminMediaLoading() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <Skeleton variant="text" width={180} height={32} />
        <Skeleton width={280} height={40} className="rounded-full" />
      </div>
      <Skeleton height={140} className="mb-8 w-full" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full" />
        ))}
      </div>
    </div>
  );
}
