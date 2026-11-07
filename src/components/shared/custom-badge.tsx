import type { LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const COLOR = {
  brand: "border-transparent bg-brand-soft text-brand-text",
  success:
    "border-transparent bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  warning:
    "border-transparent bg-amber-500/10 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200",
  danger:
    "border-transparent bg-destructive/10 text-destructive dark:bg-destructive/20",
  neutral: "border-transparent bg-muted text-muted-foreground",
  info: "border-transparent bg-sky-500/10 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  violet:
    "border-transparent bg-violet-500/10 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  rose: "border-transparent bg-rose-500/10 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
} as const

export type BadgeColor = keyof typeof COLOR

type CustomBadgeProps = {
  name: string
  color?: BadgeColor
  icon?: LucideIcon
  title?: string
  className?: string
}

export function CustomBadge({
  name,
  color = "neutral",
  icon: Icon,
  title,
  className,
}: CustomBadgeProps) {
  return (
    <Badge
      variant="secondary"
      title={title}
      className={cn(COLOR[color], className)}
    >
      {Icon ? <Icon data-icon="inline-start" aria-hidden /> : null}
      <span className="min-w-0 truncate">{name}</span>
    </Badge>
  )
}
