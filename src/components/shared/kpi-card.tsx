import { Minus, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { formatPercent } from "@/lib/format"

export type PeriodMetric = {
  current: number
  previous: number
  changePercent: number | null
}

export type KpiTone = "brand" | "success" | "info" | "violet"

const TONE: Record<KpiTone, string> = {
  brand: "bg-brand-soft text-brand-text",
  success:
    "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  info: "bg-sky-500/10 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  violet:
    "bg-violet-500/10 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
}

type KpiCardProps = {
  label: string
  value: string
  hint: string
  metric?: PeriodMetric
  icon?: LucideIcon
  tone?: KpiTone
  className?: string
}

function DeltaBadge({ metric }: { metric: PeriodMetric }) {
  if (metric.changePercent === null) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
        <Minus className="size-3" aria-hidden="true" />
        New period
      </span>
    )
  }

  if (metric.changePercent === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
        <Minus className="size-3" aria-hidden="true" />
        Flat vs prior
      </span>
    )
  }

  const up = metric.changePercent > 0

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        up
          ? "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
          : "bg-rose-500/10 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
      )}
    >
      {up ? (
        <TrendingUp className="size-3" aria-hidden="true" />
      ) : (
        <TrendingDown className="size-3" aria-hidden="true" />
      )}
      {formatPercent(metric.changePercent)} vs prior
    </span>
  )
}

export function KpiCard({
  label,
  value,
  hint,
  metric,
  icon: Icon,
  tone = "brand",
  className,
}: KpiCardProps) {
  return (
    <article
      className={cn(
        "rounded-2xl border border-border/80 bg-card p-5 text-card-foreground shadow-sm ring-1 ring-black/[0.02] dark:ring-white/[0.04]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
            {value}
          </p>
        </div>
        {Icon ? (
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl",
              TONE[tone]
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1.5">
        {metric ? <DeltaBadge metric={metric} /> : null}
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
    </article>
  )
}
