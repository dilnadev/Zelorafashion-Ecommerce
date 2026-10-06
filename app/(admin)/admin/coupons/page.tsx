import { getAdminCoupons, getCouponFormOptions } from "@/lib/queries/admin-coupons";
import { CouponManager } from "@/components/admin/CouponManager";

export const revalidate = 0;

export default async function AdminCouponsPage() {
  const [coupons, options] = await Promise.all([getAdminCoupons(), getCouponFormOptions()]);

  return <CouponManager initialCoupons={coupons} options={options} />;
}
