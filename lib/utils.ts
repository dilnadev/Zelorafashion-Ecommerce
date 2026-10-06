import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": ["text-hero", "text-section", "text-product-title", "text-body", "text-body-lg", "text-caption"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SaleableProduct {
  price: number;
  sale_price: number | null;
  sale_start: string | null;
  sale_end: string | null;
}

export function isProductOnSale(product: SaleableProduct, now: Date = new Date()): boolean {
  if (product.sale_price == null || product.sale_price >= product.price) return false;
  if (product.sale_start && new Date(product.sale_start) > now) return false;
  if (product.sale_end && new Date(product.sale_end) < now) return false;
  return true;
}

export function getEffectivePrice(product: SaleableProduct, now: Date = new Date()): number {
  return isProductOnSale(product, now) ? product.sale_price! : product.price;
}

export function formatCurrency(amount: number, currencyCode = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", options).format(d);
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return `${text.slice(0, length).trimEnd()}…`;
}
