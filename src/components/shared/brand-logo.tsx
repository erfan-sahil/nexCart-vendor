import { cn } from "@/lib/utils"

const LOGO_SRC = {
  dark: "/nexcart-logo-white.png",
  light: "/nexcart-logo-light.png",
} as const

/**
 * The white asset is a wide PNG with padding; object-view-box crops to pixels.
 * The light asset is already trimmed (orange cart + dark wordmark).
 */
const PADDED_VIEW = {
  wordmark: "inset(32.01% 7.66% 27.32% 8.33%)",
  mark: "inset(32.01% 66.05% 27.32% 8.33%)",
} as const

type BrandLogoProps = {
  className?: string
  variant?: keyof typeof PADDED_VIEW
  /** auto swaps marks for light/dark UI; on-dark is the white wordmark asset */
  tone?: "auto" | "on-dark" | "on-light"
}

function logoClassName(
  variant: keyof typeof PADDED_VIEW,
  className?: string,
  compact?: boolean
) {
  return cn(
    "w-auto max-w-none",
    compact
      ? variant === "mark"
        ? "h-7 w-7 object-cover object-left"
        : "h-7 max-w-[9.5rem] object-contain object-left"
      : cn(
          "object-cover",
          variant === "mark"
            ? "size-7 overflow-hidden object-left"
            : "aspect-[4.96/1] h-7"
        ),
    className
  )
}

function LogoImage({
  src,
  variant,
  className,
}: {
  src: string
  variant: keyof typeof PADDED_VIEW
  className?: string
}) {
  const padded = src === LOGO_SRC.dark

  return (
    <img
      src={src}
      alt="NexCart"
      style={padded ? { objectViewBox: PADDED_VIEW[variant] } : undefined}
      className={logoClassName(variant, className, !padded)}
    />
  )
}

export function BrandLogo({
  className,
  variant = "wordmark",
  tone = "on-dark",
}: BrandLogoProps) {
  if (tone === "auto") {
    return (
      <>
        <LogoImage
          src={LOGO_SRC.light}
          variant={variant}
          className={cn(className, "dark:hidden")}
        />
        <LogoImage
          src={LOGO_SRC.dark}
          variant={variant}
          className={cn(className, "hidden dark:block")}
        />
      </>
    )
  }

  const src = tone === "on-light" ? LOGO_SRC.light : LOGO_SRC.dark

  return <LogoImage src={src} variant={variant} className={className} />
}
