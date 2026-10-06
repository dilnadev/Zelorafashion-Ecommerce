import { cn } from "@/lib/utils";

interface SkeletonProps {
  variant?: "text" | "circle" | "rect";
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function Skeleton({
  variant = "rect",
  width,
  height,
  className,
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-black/[0.06]",
        "before:absolute before:inset-0",
        "before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)]",
        "before:bg-[length:1000px_100%] before:animate-shimmer",
        variant === "circle" && "rounded-full",
        variant === "text" && "rounded-md",
        variant === "rect" && "rounded",
        className
      )}
      style={{
        width: width ?? (variant === "text" ? "100%" : undefined),
        height: height ?? (variant === "text" ? "1em" : undefined),
      }}
      aria-hidden="true"
    />
  );
}
