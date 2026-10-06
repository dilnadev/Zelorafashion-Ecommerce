import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import type { LowStockProduct } from "@/lib/queries/admin";

export function LowStockAlerts({ products }: { products: LowStockProduct[] }) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <h3 className="text-body-lg text-ink">Low Stock Alerts</h3>
      </div>

      {products.length === 0 ? (
        <p className="text-body text-ink-muted">All products are well stocked.</p>
      ) : (
        <ul className="divide-y divide-black/[0.06]">
          {products.map((product) => (
            <li key={product.id} className="flex items-center justify-between py-3">
              <Link
                href={`/admin/products/${product.id}`}
                className="text-body text-ink hover:text-accent"
              >
                {product.title}
              </Link>
              <span className="text-caption normal-case tracking-normal text-amber-600">
                {product.stock_quantity} left
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
