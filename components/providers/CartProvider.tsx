"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import type { CartItem } from "@/types";

const STORAGE_KEY = "cart:v1";

export interface FlyToCartRequest {
  id: number;
  imageUrl: string;
  fromRect: DOMRect;
}

export interface AppliedCoupon {
  code: string;
  discountAmount: number;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isDrawerOpen: boolean;
  cartIconRef: RefObject<HTMLButtonElement>;
  flyRequest: FlyToCartRequest | null;
  cartPulseSignal: number;
  coupon: AppliedCoupon | null;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  flyToCart: (imageUrl: string, fromEl: HTMLElement) => void;
  clearFlyRequest: () => void;
  pulseCartIcon: () => void;
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [flyRequest, setFlyRequest] = useState<FlyToCartRequest | null>(null);
  const [cartPulseSignal, setCartPulseSignal] = useState(0);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const cartIconRef = useRef<HTMLButtonElement>(null);
  const flyIdRef = useRef(0);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {
      // corrupted localStorage — start with an empty cart
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, isHydrated]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
      const quantity = item.quantity ?? 1;
      setItems((current) => {
        const existing = current.find(
          (i) => i.productId === item.productId && i.variantId === item.variantId
        );
        if (existing) {
          const nextQuantity = Math.min(
            existing.quantity + quantity,
            existing.maxQuantity
          );
          return current.map((i) =>
            i.id === existing.id ? { ...i, quantity: nextQuantity } : i
          );
        }
        return [
          ...current,
          {
            ...item,
            quantity: Math.min(quantity, item.maxQuantity),
          },
        ];
      });
    },
    []
  );

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((current) =>
      current.map((i) =>
        i.id === id
          ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxQuantity)) }
          : i
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCoupon(null);
  }, []);
  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const applyCoupon = useCallback((next: AppliedCoupon) => setCoupon(next), []);
  const removeCoupon = useCallback(() => setCoupon(null), []);

  const flyToCart = useCallback((imageUrl: string, fromEl: HTMLElement) => {
    flyIdRef.current += 1;
    setFlyRequest({
      id: flyIdRef.current,
      imageUrl,
      fromRect: fromEl.getBoundingClientRect(),
    });
  }, []);

  const clearFlyRequest = useCallback(() => setFlyRequest(null), []);
  const pulseCartIcon = useCallback(() => setCartPulseSignal((n) => n + 1), []);

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount,
      subtotal,
      isDrawerOpen,
      cartIconRef,
      flyRequest,
      cartPulseSignal,
      coupon,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      openDrawer,
      closeDrawer,
      flyToCart,
      clearFlyRequest,
      pulseCartIcon,
      applyCoupon,
      removeCoupon,
    }),
    [
      items,
      itemCount,
      subtotal,
      isDrawerOpen,
      flyRequest,
      cartPulseSignal,
      coupon,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      openDrawer,
      closeDrawer,
      flyToCart,
      clearFlyRequest,
      pulseCartIcon,
      applyCoupon,
      removeCoupon,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
