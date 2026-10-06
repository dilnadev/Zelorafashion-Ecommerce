import Link from "next/link";
import { CountdownTimer } from "./CountdownTimer";

interface SaleBannerProps {
  productTitle: string;
  productSlug: string;
  saleEnd: string;
}

export function SaleBanner({ productTitle, productSlug, saleEnd }: SaleBannerProps) {
  return (
    <section className="mx-6 my-20 overflow-hidden rounded bg-ink px-8 py-12 md:mx-16 md:px-16">
      <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
        <div>
          <p className="text-caption uppercase tracking-[0.12em] text-accent">Limited Time</p>
          <h2 className="mt-2 max-w-md font-serif text-section text-white">
            Sale ends soon on {productTitle}
          </h2>
          <Link
            href={`/products/${productSlug}`}
            className="mt-4 inline-block text-body font-medium text-white underline underline-offset-4"
          >
            Shop the sale
          </Link>
        </div>
        <CountdownTimer target={saleEnd} />
      </div>
    </section>
  );
}
