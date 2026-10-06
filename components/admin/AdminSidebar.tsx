"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Tag,
  Settings,
  Search,
  Image as ImageIcon,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/seo", label: "SEO", icon: Search },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-body transition-colors",
              isActive ? "bg-accent/10 text-accent" : "text-ink-muted hover:bg-black/[0.04] hover:text-ink"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminSidebar({ adminName }: { adminName: string }) {
  const { signOut } = useAuth();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <aside className="hidden w-60 shrink-0 flex-col border-r border-black/[0.06] bg-white p-4 md:flex print:hidden">
        <Link href="/admin" className="mb-8 px-2 font-serif text-xl text-ink">
          Store Admin
        </Link>
        <NavLinks />
        <div className="mt-4 border-t border-black/[0.06] pt-4">
          <p className="truncate px-3 text-caption normal-case tracking-normal text-ink-muted">
            {adminName}
          </p>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-1 flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-body text-destructive transition-colors hover:bg-destructive/5"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex items-center justify-between border-b border-black/[0.06] bg-white px-4 py-3 md:hidden print:hidden">
        <Link href="/admin" className="font-serif text-lg text-ink">
          Store Admin
        </Link>
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open menu"
          className="cursor-pointer p-1 text-ink"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.div
              className="absolute inset-0 bg-ink/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative z-10 flex h-full w-64 flex-col bg-white p-4"
            >
              <div className="mb-8 flex items-center justify-between px-2">
                <span className="font-serif text-xl text-ink">Store Admin</span>
                <button
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  aria-label="Close menu"
                  className="cursor-pointer p-1 text-ink-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <NavLinks onNavigate={() => setIsMobileOpen(false)} />
              <div className="mt-4 border-t border-black/[0.06] pt-4">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-body text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
