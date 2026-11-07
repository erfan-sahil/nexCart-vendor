"use client"

import { useMemo, useState } from "react"

import { AreaChart, BarChart, type AreaChartTone } from "@/components/charts"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatBucketLabel, formatCompactMoney } from "@/lib/format"

import { analyticsPanelClass } from "../lib/analytics-surface"
import type { VendorAnalytics } from "../types"

type RevenueTrendCardProps = {
  series: VendorAnalytics["series"]
  bucket: VendorAnalytics["bucket"]
  rangeLabel: string
}

type RevenueMetric = "grossSales" | "netEarnings"

export function RevenueTrendCard({
  series,
  bucket,
  rangeLabel,
}: RevenueTrendCardProps) {
  const [metric, setMetric] = useState<RevenueMetric>("grossSales")

  const revenueTotal = useMemo(
    () => series.reduce((sum, point) => sum + point[metric], 0),
    [series, metric]
  )

  const orderTotal = useMemo(
    () => series.reduce((sum, point) => sum + point.orders, 0),
    [series]
  )

  const areaData = useMemo(
    () =>
      series.map((point) => ({
        label: formatBucketLabel(point.date, bucket),
        value: point[metric],
        title: `${formatBucketLabel(point.date, bucket)}: ${formatCompactMoney(point[metric])}`,
      })),
    [series, bucket, metric]
  )

  const orderBars = useMemo(
    () =>
      series.map((point) => ({
        label: formatBucketLabel(point.date, bucket),
        value: point.orders,
        title: `${formatBucketLabel(point.date, bucket)}: ${point.orders} orders`,
      })),
    [series, bucket]
  )

  const metricLabel = metric === "grossSales" ? "Gross sales" : "Net earnings"
  const chartTone: AreaChartTone = metric === "grossSales" ? "gross" : "success"
  const isGross = metric === "grossSales"

  return (
    <article className={`p-4 sm:p-6 ${analyticsPanelClass}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold">Revenue trend</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {metricLabel} by {bucket === "month" ? "month" : "period"} for the
            last {rangeLabel}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Tabs
            value={metric}
            onValueChange={(value) => setMetric(value as RevenueMetric)}
          >
            <TabsList>
              <TabsTrigger value="grossSales">Gross</TabsTrigger>
              <TabsTrigger value="netEarnings">Net</TabsTrigger>
            </TabsList>
          </Tabs>
          <p
            className={cn(
              "rounded-full px-3 py-1 text-sm font-semibold tabular-nums",
              isGross
                ? "bg-sky-500/15 text-sky-900 dark:bg-sky-500/20 dark:text-sky-100"
                : "bg-emerald-500/15 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-100"
            )}
          >
            {formatCompactMoney(revenueTotal)}
          </p>
        </div>
      </div>
      <div
        className={cn(
          "mt-6 rounded-xl border p-4 sm:p-5",
          isGross
            ? "border-sky-500/20 bg-sky-500/[0.06] dark:border-sky-400/25 dark:bg-sky-500/[0.1]"
            : "border-emerald-500/20 bg-emerald-500/[0.06] dark:border-emerald-400/25 dark:bg-emerald-500/[0.1]"
        )}
      >
        <AreaChart
          data={areaData}
          formatValue={formatCompactMoney}
          height={176}
          tone={chartTone}
        />
      </div>
      <div className="mt-8 rounded-xl border border-violet-500/20 bg-violet-500/[0.06] p-4 sm:p-5 dark:border-violet-400/25 dark:bg-violet-500/[0.1]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold">Order volume</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Orders per {bucket === "month" ? "month" : "bucket"} in this
              range.
            </p>
          </div>
          <p className="rounded-full bg-violet-500/15 px-3 py-1 text-sm font-semibold text-violet-900 tabular-nums dark:bg-violet-500/25 dark:text-violet-100">
            {orderTotal}
          </p>
        </div>
        <div className="mt-4">
          <BarChart
            data={orderBars}
            formatValue={(value) => String(value)}
            tone="volume"
          />
        </div>
      </div>
    </article>
  )
}
