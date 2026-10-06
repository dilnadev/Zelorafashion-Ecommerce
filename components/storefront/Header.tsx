"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { Menu, Search, User, Heart, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { cn } from "@/lib/utils";
import { SearchModal } from "@/components/storefront/SearchModal";
import type { SiteSettingsData } from "@/lib/site-settings";
import type { Category } from "@/types";

interface HeaderProps {
  settings: SiteSettingsData;
  categories: Category[];
}

export function Header({ settings, categories }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { itemCount, openDrawer, cartIconRef, cartPulseSignal } = useCart();
  const { ids: wishlistIds } = useWishlist();
  const cartIconControls = useAnimation();

  const navLinks = [
    { label: "New Arrivals", href: "/products?sort=newest" },
    ...categories.map((c) => ({ label: c.name, href: `/products?category=${c.slug}` })),
  ];

  useEffect(() => {
    if (cartPulseSignal === 0) return;
    // Spring/inertia transitions only support two keyframes, so the
    // 1 -> 1.3 -> 1 bounce is two chained spring animations, not one.
    async function bounce() {
      await cartIconControls.start({
        scale: 1.3,
        transition: { type: "spring", stiffness: 400 },
      });
      await cartIconControls.start({
        scale: 1,
        transition: { type: "spring", stiffness: 400 },
      });
    }
    bounce();
  }, [cartPulseSignal, cartIconControls]);

  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <motion.header
        className={cn(
          "sticky top-0 z-40 border-b border-transparent bg-bg/90 backdrop-blur-md transition-[height,border-color] duration-300 ease-out",
          isScrolled && "border-ink/[0.08]"
        )}
        animate={{ height: isScrolled ? 64 : 88 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="mx-auto flex h-full max-w-content items-center justify-between px-6 md:px-16">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
            className="cursor-pointer p-2 text-ink transition-colors hover:text-accent md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link
            href="/"
            className="flex items-center gap-3 font-serif text-2xl tracking-tight text-ink"
          >
            {settings.logo_url ? (
              <span className="relative block h-12 w-32">
                <Image
                  src={settings.logo_url}
                  alt={settings.site_name}
                  fill
                  priority
                  className="object-contain object-left"
                />
              </span>
            ) : (
              settings.site_name
            )}
          </Link>

          <nav className="hidden items-center gap-10 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative py-2 text-caption uppercase tracking-[0.12em] text-ink"
              >
                {link.label}
                <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-ink transition-transform duration-300 ease-out group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search"
              className="cursor-pointer rounded p-2 text-ink transition-colors hover:bg-ink/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <Search className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <Link
              href="/account"
              aria-label="Account"
              className="hidden cursor-pointer rounded p-2 text-ink transition-colors hover:bg-ink/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:inline-flex"
            >
              <User className="h-5 w-5" strokeWidth={1.5} />
            </Link>
            <Link
              href="/account/wishlist"
              aria-label={`Wishlist, ${wishlistIds.size} items`}
              className="relative hidden cursor-pointer rounded p-2 text-ink transition-colors hover:bg-ink/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:inline-flex"
            >
              <Heart className="h-5 w-5" strokeWidth={1.5} />
              {wishlistIds.size > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-medium text-white">
                  {wishlistIds.size > 9 ? "9+" : wishlistIds.size}
                </span>
              )}
            </Link>
            <button
              ref={cartIconRef}
              type="button"
              onClick={openDrawer}
              aria-label={`Bag, ${itemCount} items`}
              className="relative cursor-pointer rounded p-2 text-ink transition-colors hover:bg-ink/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <motion.span animate={cartIconControls} className="block">
                <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
              </motion.span>
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[10px] font-medium text-white"
                  >
                    {itemCount > 9 ? "9+" : itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex flex-col bg-bg px-6 py-6 md:hidden"
          >
            <div className="flex items-center justify-between">
              <span className="font-serif text-xl text-ink">{settings.site_name}</span>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
                className="cursor-pointer p-2 text-ink"
              >
                <X className="h-6 w-6" strokeWidth={1.5} />
              </button>
            </div>
            <nav className="mt-12 flex flex-col gap-7">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.08, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="font-serif text-4xl text-ink"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-4 border-t border-ink/10 pt-6">
              {[
                { label: "Account", href: "/account" },
                { label: "Wishlist", href: "/account/wishlist" },
                { label: "Contact", href: "/contact" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-caption uppercase tracking-[0.12em] text-ink-muted"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
