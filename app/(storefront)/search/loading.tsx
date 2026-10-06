import { Skeleton } from "@/components/ui/Skeleton";
import { ProductGridSkeleton } from "@/components/storefront/ProductGridSkeleton";

export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-content px-6 py-10 md:px-16">
      <Skeleton variant="text" width={120} height={32} className="mb-6" />
      <Skeleton height={56} width={400} className="mb-10 rounded" />
      <ProductGridSkeleton count={8} />
    </div>
  );
}
