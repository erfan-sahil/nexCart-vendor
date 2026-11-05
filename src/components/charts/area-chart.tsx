import { memo, useMemo } from "react"

import { cn } from "@/lib/utils"

export type AreaChartPoint = {
  label: string
  value: number
  title?: string
}

type AreaChartProps = {
  data: AreaChartPoint[]
  className?: string
  formatValue?: (value: number) => string
  height?: number
}

function AreaChartComponent({
  data,
  className,
  formatValue = (value) => String(value),
  height = 160,
}: AreaChartProps) {
  const geometry = useMemo(() => {
    if (data.length === 0) {
      return null
    }

    const width = Math.max(data.length, 2)
    const maxValue = Math.max(1, ...data.map((point) => point.value))
    const step = width / Math.max(data.length - 1, 1)

    const points = data.map((point, index) => {
      const x = index * step
      const y = height - (point.value / maxValue) * (height - 8) - 4
      return { x, y, point, index }
    })

    const line = points.map((p) => `${p.x},${p.y}`).join(" ")
    const area = `0,${height} ${line} ${points[points.length - 1]?.x ?? 0},${height}`

    return { width, points, line, area, maxValue }
  }, [data, height])

  if (!geometry) {
    return (
      <p className="text-sm text-muted-foreground">No data for this period.</p>
    )
  }

  return (
    <div className={cn("w-full", className)} role="img" aria-label="Area chart">
      <svg
        viewBox={`0 0 ${geometry.width} ${height}`}
        className="h-40 w-full text-primary"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="analyticsAreaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--brand)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            x1={0}
            x2={geometry.width}
            y1={height * ratio}
            y2={height * ratio}
            className="stroke-border"
            strokeWidth={0.5}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <polygon points={geometry.area} fill="url(#analyticsAreaFill)" />
        <polyline
          points={geometry.line}
          fill="none"
          stroke="var(--brand)"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
        />
        {geometry.points.map(({ x, y, point }) => (
          <circle
            key={point.label}
            cx={x}
            cy={y}
            r={2.5}
            className="fill-[var(--brand)]"
          >
            <title>
              {point.title ?? `${point.label}: ${formatValue(point.value)}`}
            </title>
          </circle>
        ))}
      </svg>
      <div className="mt-2 flex justify-between gap-1 text-[10px] text-muted-foreground">
        {data.map((point) => (
          <span
            key={point.label}
            className="min-w-0 flex-1 truncate text-center"
          >
            {point.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export const AreaChart = memo(AreaChartComponent)
