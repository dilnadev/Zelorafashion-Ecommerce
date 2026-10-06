import Link from "next/link";
import Image from "next/image";

const BANNER_IMAGE =
  "https://dlnpvbfottgzplbincbz.supabase.co/storage/v1/object/public/media-library/1791265476066-ChatGPT-Image-Oct-6%2C-2026%2C-11_12_21-AM-(1).png";

interface PageBannerProps {
  title: string;
  breadcrumbLabel?: string;
  description?: string;
}

export function PageBanner({ title, breadcrumbLabel, description }: PageBannerProps) {
  return (
    <div className="relative overflow-hidden px-6 py-16 text-center md:px-16 md:py-24">
      <Image
        src={BANNER_IMAGE}
        alt=""
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-ink/50" />
      <div className="relative z-10">
        <nav className="mb-4 text-caption normal-case tracking-normal text-white/80">
          <Link href="/" className="hover:text-white">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-white">{breadcrumbLabel ?? title}</span>
        </nav>
        <h1 className="font-serif text-section text-white">{title}</h1>
        {description && (
          <p className="mx-auto mt-3 max-w-lg text-body-lg text-white/85">{description}</p>
        )}
      </div>
    </div>
  );
}
