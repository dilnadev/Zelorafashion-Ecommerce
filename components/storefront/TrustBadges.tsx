import { Truck, ShieldCheck, RotateCcw, Headphones } from "lucide-react";

const BADGES = [
  { icon: Truck, label: "Free Shipping Over ₹2,000" },
  { icon: ShieldCheck, label: "Secure Checkout" },
  { icon: RotateCcw, label: "30-Day Returns" },
  { icon: Headphones, label: "Dedicated Support" },
];

export function TrustBadges() {
  const track = [...BADGES, ...BADGES];

  return (
    <section className="overflow-hidden border-y border-ink/[0.08] bg-bg-cream py-8">
      <div className="flex w-max animate-marquee gap-16">
        {track.map((badge, i) => (
          <div
            key={i}
            className="flex shrink-0 items-center gap-3 text-caption text-ink-muted"
          >
            <badge.icon className="h-5 w-5 text-ink" />
            {badge.label}
          </div>
        ))}
      </div>
    </section>
  );
}
