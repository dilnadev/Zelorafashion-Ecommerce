import { Skeleton } from "@/components/ui/Skeleton";

export function ContentSkeleton({ lines = 4, titleWidth = 180 }: { lines?: number; titleWidth?: number }) {
  return (
    <div>
      <Skeleton variant="text" width={titleWidth} height={28} className="mb-8" />
      <div className="space-y-4">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} height={72} className="w-full" />
        ))}
      </div>
    </div>
  );
}
