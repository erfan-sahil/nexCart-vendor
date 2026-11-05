import { memo, useMemo } from "react"

import { cn } from "@/lib/utils"

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
}

function BarChartComponent({
  data,
  className,
  formatValue = (value) => String(value),
  barClassName,
}: BarChartProps) {
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
        const share = Math.max(4, Math.round((point.value / maxValue) * 100))
        const title =
          point.title ?? `${point.label}: ${formatValue(point.value)}`

        return (
          <div
            key={point.label}
            className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2"
          >
            <div className="flex h-36 items-end">
              <div
                className={cn("w-full rounded-md bg-primary", barClassName)}
                style={{
                  height: `${share}%`,
                  backgroundImage:
                    "linear-gradient(to top, var(--brand-deep), var(--brand))",
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
