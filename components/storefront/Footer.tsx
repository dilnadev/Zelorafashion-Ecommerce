import Link from "next/link";
import {
  InstagramIcon,
  FacebookIcon,
  TwitterIcon,
  YoutubeIcon,
} from "@/components/ui/SocialIcons";
import { SizeGuideModal } from "@/components/storefront/SizeGuideModal";
import type { SiteSettingsData } from "@/lib/site-settings";
import { cn } from "@/lib/utils";

// On mobile the 2-col grid stacks Shop/Support in row 2 and Company
// alone in row 3; Company is swapped ahead of Support there so it
// doesn't dangle by itself. Desktop's single 5-col row keeps DOM order.
const MOBILE_COLUMN_ORDER: Record<string, string> = {
  Shop: "order-1",
  Company: "order-2",
  Support: "order-3",
};

const FOOTER_COLUMNS = [
  {
    heading: "Shop",
    links: [
      { label: "All Products", href: "/products" },
      { label: "New Arrivals", href: "/products?sort=newest" },
      { label: "Best Sellers", href: "/products?sort=best-selling" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Track Order", href: "/track-order" },
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/about#faq" },
      { label: "Shipping Policy", href: "/shipping-policy" },
      { label: "Returns Policy", href: "/returns-policy" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-of-service" },
    ],
  },
];

const SOCIAL_LINKS = (settings: SiteSettingsData) => [
  { icon: InstagramIcon, url: settings.social_instagram, label: "Instagram" },
  { icon: FacebookIcon, url: settings.social_facebook, label: "Facebook" },
  { icon: TwitterIcon, url: settings.social_twitter, label: "Twitter" },
  { icon: YoutubeIcon, url: settings.social_youtube, label: "YouTube" },
];

export function Footer({ settings }: { settings: SiteSettingsData }) {
  const socials = SOCIAL_LINKS(settings).filter(
    (social): social is typeof social & { url: string } => Boolean(social.url)
  );
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ink/[0.08] bg-bg-cream">
      <div className="mx-auto max-w-content px-6 py-16 md:px-16 md:py-24">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-5">
          <div className="col-span-2">
            <p className="font-serif text-2xl text-ink">{settings.site_name}</p>
            <p className="mt-3 max-w-xs text-body text-ink-muted">
              {settings.tagline ||
                `${settings.site_name} is a modern women's fashion destination — considered silhouettes, refined details, and timeless design for everyday elegance.`}
            </p>
            {socials.length > 0 && (
              <div className="mt-6 flex items-center gap-3">
                {socials.map(({ icon: Icon, label, url }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="rounded-full border border-ink/[0.08] p-2 text-ink-muted transition-colors hover:border-accent hover:text-accent"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div
              key={column.heading}
              className={cn(MOBILE_COLUMN_ORDER[column.heading], "md:order-none")}
            >
              <p className="text-caption text-ink-muted">{column.heading}</p>
              <ul className="mt-4 flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-body text-ink transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                {column.heading === "Support" && (
                  <li>
                    <SizeGuideModal />
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-ink/[0.08] pt-8 text-caption text-ink-muted md:flex-row">
          <p>
            © {year} {settings.site_name}. All rights reserved.
          </p>
          <p className="normal-case tracking-normal">
            {settings.contact_email}
          </p>
        </div>
      </div>
    </footer>
  );
}
