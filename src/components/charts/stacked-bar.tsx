import { memo, useMemo } from "react"

import { cn } from "@/lib/utils"

export type StackedBarSegment = {
  key: string
  label: string
  value: number
  className?: string
}

type StackedBarProps = {
  segments: StackedBarSegment[]
  className?: string
  showLegend?: boolean
}

const DEFAULT_COLORS = [
  "bg-brand",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-orange-500",
  "bg-teal-500",
]

function StackedBarComponent({
  segments,
  className,
  showLegend = true,
}: StackedBarProps) {
  const total = useMemo(
    () => segments.reduce((sum, segment) => sum + segment.value, 0),
    [segments]
  )

  if (total === 0) {
    return (
      <p className="text-sm text-muted-foreground">No data for this period.</p>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div
        className="flex h-3 w-full overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label="Stacked distribution bar"
      >
        {segments.map((segment, index) => {
          const width = (segment.value / total) * 100
          if (width <= 0) {
            return null
          }

          return (
            <div
              key={segment.key}
              className={cn(
                segment.className ??
                  DEFAULT_COLORS[index % DEFAULT_COLORS.length],
                "h-full min-w-0 transition-[width]"
              )}
              style={{ width: `${width}%` }}
              title={`${segment.label}: ${segment.value}`}
            />
          )
        })}
      </div>
      {showLegend ? (
        <ul className="grid gap-2 sm:grid-cols-2">
          {segments
            .filter((segment) => segment.value > 0)
            .map((segment, index) => (
              <li
                key={segment.key}
                className="flex items-center justify-between gap-2 text-xs"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      segment.className ??
                        DEFAULT_COLORS[index % DEFAULT_COLORS.length]
                    )}
                    aria-hidden="true"
                  />
                  <span className="truncate text-muted-foreground">
                    {segment.label}
                  </span>
                </span>
                <span className="shrink-0 font-medium tabular-nums">
                  {segment.value}
                </span>
              </li>
            ))}
        </ul>
      ) : null}
    </div>
  )
}

export const StackedBar = memo(StackedBarComponent)
