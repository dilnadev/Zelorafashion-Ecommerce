import { Skeleton } from "@/components/ui/Skeleton";
import { ProductGridSkeleton } from "@/components/storefront/ProductGridSkeleton";

export default function AccountWishlistLoading() {
  return (
    <div>
      <Skeleton variant="text" width={140} height={28} className="mb-8" />
      <ProductGridSkeleton count={4} />
    </div>
  );
}
