"use client"

import { useMemo, useState } from "react"

import { AreaChart, BarChart } from "@/components/charts"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatBucketLabel, formatCompactMoney } from "@/lib/format"

import type { VendorAnalytics } from "../types"

type RevenueTrendCardProps = {
  series: VendorAnalytics["series"]
  bucket: VendorAnalytics["bucket"]
}

type RevenueMetric = "grossSales" | "netEarnings"

export function RevenueTrendCard({ series, bucket }: RevenueTrendCardProps) {
  const [metric, setMetric] = useState<RevenueMetric>("grossSales")

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

  return (
    <article className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold">Revenue trend</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {metric === "grossSales" ? "Gross sales" : "Net earnings"} and order
            volume over time.
          </p>
        </div>
        <Tabs
          value={metric}
          onValueChange={(value) => setMetric(value as RevenueMetric)}
        >
          <TabsList>
            <TabsTrigger value="grossSales">Gross</TabsTrigger>
            <TabsTrigger value="netEarnings">Net</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="mt-6">
        <AreaChart data={areaData} formatValue={formatCompactMoney} />
      </div>
      <div className="mt-8 border-t border-border pt-6">
        <h3 className="text-xs font-medium text-muted-foreground">Orders</h3>
        <div className="mt-4">
          <BarChart
            data={orderBars}
            formatValue={(value) => String(value)}
            barClassName="opacity-80"
          />
        </div>
      </div>
    </article>
  )
}
