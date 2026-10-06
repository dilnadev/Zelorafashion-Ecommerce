"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, MapPin, Heart, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/account", label: "Dashboard", icon: LayoutDashboard },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

export function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <nav className="hidden w-56 shrink-0 flex-col gap-1 md:flex">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/account" ? pathname === "/account" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded px-4 py-2.5 text-body transition-colors",
                isActive ? "bg-ink text-white" : "text-ink hover:bg-ink/[0.04]"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-4 flex cursor-pointer items-center gap-3 rounded px-4 py-2.5 text-body text-destructive transition-colors hover:bg-destructive/5"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </nav>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-ink/[0.08] bg-white py-2 md:hidden">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/account" ? pathname === "/account" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1 text-caption normal-case tracking-normal",
                isActive ? "text-accent" : "text-ink-muted"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
