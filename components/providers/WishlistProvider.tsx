"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/components/providers/AuthProvider";

interface WishlistContextValue {
  ids: Set<string>;
  isLoaded: boolean;
  isWishlisted: (productId: string) => boolean;
  toggle: (productId: string) => Promise<"added" | "removed" | "signin-required">;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      setIds(new Set());
      setIsLoaded(true);
      return;
    }
    let cancelled = false;
    import("@/lib/supabase/client").then(({ createClient }) => {
      if (cancelled) return;
      const supabase = createClient();
      supabase
        .from("wishlist")
        .select("product_id")
        .eq("user_id", user.id)
        .then(({ data }) => {
          if (cancelled) return;
          setIds(new Set((data ?? []).map((row) => row.product_id)));
          setIsLoaded(true);
        });
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const toggle = useCallback(
    async (productId: string) => {
      if (!user) return "signin-required" as const;

      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const currentlyWishlisted = ids.has(productId);

      setIds((prev) => {
        const next = new Set(prev);
        if (currentlyWishlisted) next.delete(productId);
        else next.add(productId);
        return next;
      });

      if (currentlyWishlisted) {
        await supabase.from("wishlist").delete().eq("user_id", user.id).eq("product_id", productId);
        return "removed" as const;
      }
      await supabase.from("wishlist").insert({ user_id: user.id, product_id: productId });
      return "added" as const;
    },
    [user, ids]
  );

  const value = useMemo<WishlistContextValue>(
    () => ({ ids, isLoaded, isWishlisted: (id: string) => ids.has(id), toggle }),
    [ids, isLoaded, toggle]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
