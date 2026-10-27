import { cn } from "@/lib/utils"

const LOGO_SRC = "/nexcart-logo-white.png"

/**
 * The source file is a wide transparent PNG with padding around the mark.
 * These insets crop to the drawn pixels: the cart, then the wordmark.
 */
const VIEW = {
  wordmark: "inset(32.01% 7.66% 27.32% 8.33%)",
  mark: "inset(32.01% 66.05% 27.32% 8.33%)",
} as const

type BrandLogoProps = {
  className?: string
  variant?: keyof typeof VIEW
}

export function BrandLogo({ className, variant = "wordmark" }: BrandLogoProps) {
  return (
    <img
      src={LOGO_SRC}
      alt="NexCart"
      style={{ objectViewBox: VIEW[variant] }}
      className={cn(
        "w-auto max-w-none object-cover",
        variant === "mark" ? "aspect-[1.51/1] h-7" : "aspect-[4.96/1] h-7",
        className
      )}
    />
  )
}
