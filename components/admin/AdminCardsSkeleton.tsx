import { Skeleton } from "@/components/ui/Skeleton";

export function AdminCardsSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <div>
      <Skeleton variant="text" width={160} height={32} className="mb-8" />
      <div className="space-y-6">
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-black/[0.06] bg-white p-6">
            <Skeleton variant="text" width={180} height={20} className="mb-4" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton height={56} />
              <Skeleton height={56} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
