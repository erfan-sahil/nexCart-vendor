import { memo, useMemo } from "react"

import { cn } from "@/lib/utils"

import { getBarChartTheme, type BarChartTone } from "./chart-theme"

export type BarChartPoint = {
  label: string
  value: number
  title?: string
}

type BarChartProps = {
  data: BarChartPoint[]
  className?: string
  formatValue?: (value: number) => string
  barClassName?: string
  tone?: BarChartTone
}

function BarChartComponent({
  data,
  className,
  formatValue = (value) => String(value),
  barClassName,
  tone = "brand",
}: BarChartProps) {
  const theme = getBarChartTheme(tone)

  const maxValue = useMemo(
    () => Math.max(1, ...data.map((point) => point.value)),
    [data]
  )

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No data for this period.</p>
    )
  }

  return (
    <div
      className={cn("flex h-44 items-end gap-2 sm:gap-3", className)}
      role="img"
      aria-label="Bar chart"
    >
      {data.map((point) => {
        const share = Math.max(6, Math.round((point.value / maxValue) * 100))
        const title =
          point.title ?? `${point.label}: ${formatValue(point.value)}`
        const isPeak = point.value === maxValue && point.value > 0

        return (
          <div
            key={point.label}
            className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2"
          >
            <div className="relative flex h-36 w-full items-end">
              <div
                className={cn(
                  "absolute inset-x-0 top-2 bottom-0 rounded-lg",
                  theme.trackClassName
                )}
                aria-hidden="true"
              />
              <div
                className={cn(
                  "relative z-10 w-full rounded-lg shadow-sm",
                  isPeak ? "ring-2 ring-white/80 dark:ring-card/80" : null,
                  barClassName
                )}
                style={{
                  height: `${share}%`,
                  backgroundImage: theme.gradient,
                }}
                title={title}
              >
                <title>{title}</title>
              </div>
            </div>
            <span className="truncate text-center text-[11px] text-muted-foreground">
              {point.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export const BarChart = memo(BarChartComponent)
