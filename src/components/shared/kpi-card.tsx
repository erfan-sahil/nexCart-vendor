import { Minus, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react"

import { CustomBadge } from "@/components/shared/custom-badge"
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
    return <CustomBadge name="New period" color="neutral" icon={Minus} />
  }

  if (metric.changePercent === 0) {
    return <CustomBadge name="Flat vs prior" color="neutral" icon={Minus} />
  }

  const up = metric.changePercent > 0

  return (
    <CustomBadge
      name={`${formatPercent(metric.changePercent)} vs prior`}
      color={up ? "success" : "rose"}
      icon={up ? TrendingUp : TrendingDown}
      className="tabular-nums"
    />
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
