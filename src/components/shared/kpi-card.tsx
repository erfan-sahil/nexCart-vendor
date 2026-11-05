import { Minus, TrendingDown, TrendingUp } from "lucide-react"

import { cn } from "@/lib/utils"
import { formatPercent } from "@/lib/format"

export type PeriodMetric = {
  current: number
  previous: number
  changePercent: number | null
}

type KpiCardProps = {
  label: string
  value: string
  hint: string
  metric?: PeriodMetric
  className?: string
}

function DeltaBadge({ metric }: { metric: PeriodMetric }) {
  if (metric.changePercent === null) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
        <Minus className="size-3" aria-hidden="true" />
        New period
      </span>
    )
  }

  if (metric.changePercent === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
        <Minus className="size-3" aria-hidden="true" />
        Flat vs prior
      </span>
    )
  }

  const up = metric.changePercent > 0

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        up
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-rose-600 dark:text-rose-400"
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
  className,
}: KpiCardProps) {
  return (
    <article
      className={cn(
        "rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm",
        className
      )}
    >
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      <p className="mt-3 text-xs text-muted-foreground">
        {metric ? <DeltaBadge metric={metric} /> : null}
        {metric ? <span className="px-1.5">·</span> : null}
        {hint}
      </p>
    </article>
  )
}
