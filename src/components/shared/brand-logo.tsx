import { cn } from "@/lib/utils"

const LOGO_SRC = {
  dark: "/nexcart-logo-white.png",
  light: "/nexcart-logo-black.png",
} as const

/** object-view-box trims canvas padding (inset: top right bottom left). */
const PADDED_VIEW = {
  wordmark: {
    light: "inset(19% 7.66% 15% 8.33%)",
    dark: "inset(32.01% 7.66% 27.32% 8.33%)",
  },
  mark: "inset(32.01% 66.05% 27.32% 8.33%)",
} as const

type LogoVariant = "wordmark" | "mark"

function viewBox(src: string, variant: LogoVariant): string {
  if (variant === "mark") {
    return PADDED_VIEW.mark
  }
  return src === LOGO_SRC.light
    ? PADDED_VIEW.wordmark.light
    : PADDED_VIEW.wordmark.dark
}

type BrandLogoProps = {
  className?: string
  variant?: LogoVariant
  /** auto swaps marks for light/dark UI; on-dark is the white wordmark asset */
  tone?: "auto" | "on-dark" | "on-light"
}

function LogoImage({
  src,
  variant,
  className,
}: {
  src: string
  variant: LogoVariant
  className?: string
}) {
  return (
    <img
      src={src}
      alt="NexCart"
      style={{ objectViewBox: viewBox(src, variant) }}
      className={cn(
        "absolute inset-0 size-full object-cover object-left",
        className
      )}
    />
  )
}

function logoShellClass(variant: LogoVariant, className?: string) {
  return cn(
    "relative inline-block shrink-0",
    variant === "mark" ? "aspect-square h-7" : "aspect-[4.96/1] h-7 max-w-full",
    className
  )
}

export function BrandLogo({
  className,
  variant = "wordmark",
  tone = "on-dark",
}: BrandLogoProps) {
  if (tone === "auto") {
    return (
      <span className={logoShellClass(variant, className)}>
        <LogoImage
          src={LOGO_SRC.light}
          variant={variant}
          className="dark:hidden"
        />
        <LogoImage
          src={LOGO_SRC.dark}
          variant={variant}
          className="hidden dark:block"
        />
      </span>
    )
  }

  const src = tone === "on-light" ? LOGO_SRC.light : LOGO_SRC.dark

  return (
    <span className={logoShellClass(variant, className)}>
      <LogoImage src={src} variant={variant} />
    </span>
  )
}
