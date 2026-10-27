import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const TONE = {
  brand: "bg-brand-soft text-brand-text",
  success:
    "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  warning:
    "bg-amber-500/10 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200",
  danger: "bg-destructive/10 text-destructive",
  neutral: "bg-muted text-muted-foreground",
} as const

export type StatusBadgeTone = keyof typeof TONE

type StatusBadgeProps = {
  icon: LucideIcon
  tone?: StatusBadgeTone
  children: string
  title?: string
  className?: string
}

export function StatusBadge({
  icon: Icon,
  tone = "neutral",
  children,
  title,
  className,
}: StatusBadgeProps) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex h-5 w-fit items-center gap-1 rounded-full px-2 text-xs font-medium",
        TONE[tone],
        className
      )}
    >
      <Icon className="size-3 shrink-0" aria-hidden />
      {children}
    </span>
  )
}
