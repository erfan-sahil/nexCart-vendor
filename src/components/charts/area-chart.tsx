import { memo, useId, useMemo } from "react"

import { cn } from "@/lib/utils"

import { getAreaChartTheme, type AreaChartTone } from "./chart-theme"

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
  tone?: AreaChartTone
}

function AreaChartComponent({
  data,
  className,
  formatValue = (value) => String(value),
  height = 160,
  tone = "brand",
}: AreaChartProps) {
  const gradientId = useId().replace(/:/g, "")
  const theme = getAreaChartTheme(tone)

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

  const chartHeightClass =
    height >= 176 ? "h-44" : height >= 160 ? "h-40" : "h-36"
  const showDots = data.length <= 24

  return (
    <div className={cn("w-full", className)} role="img" aria-label="Area chart">
      <svg
        viewBox={`0 0 ${geometry.width} ${height}`}
        className={cn(chartHeightClass, "w-full")}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.fillTop} stopOpacity="0.32" />
            <stop
              offset="65%"
              stopColor={theme.fillBottom}
              stopOpacity="0.08"
            />
            <stop offset="100%" stopColor={theme.fillBottom} stopOpacity="0" />
          </linearGradient>
        </defs>
        <line
          x1={0}
          x2={geometry.width}
          y1={height - 1}
          y2={height - 1}
          className="stroke-border/80"
          strokeWidth={0.75}
          vectorEffect="non-scaling-stroke"
        />
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            x1={0}
            x2={geometry.width}
            y1={height * ratio}
            y2={height * ratio}
            className="stroke-border/50"
            strokeDasharray="4 6"
            strokeWidth={0.5}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <polygon points={geometry.area} fill={`url(#${gradientId})`} />
        <polyline
          points={geometry.line}
          fill="none"
          stroke={theme.line}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {showDots
          ? geometry.points.map(({ x, y, point }) => (
              <circle
                key={point.label}
                cx={x}
                cy={y}
                r={3}
                fill={theme.dotStroke}
                vectorEffect="non-scaling-stroke"
              >
                <title>
                  {point.title ?? `${point.label}: ${formatValue(point.value)}`}
                </title>
              </circle>
            ))
          : null}
      </svg>
      <div className="mt-3 flex justify-between gap-1 text-[11px] text-muted-foreground">
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
