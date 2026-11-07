import { BarChart } from "@/components/charts"
import { formatBucketLabel, formatCompactMoney } from "@/lib/format"

import { dashboardPanelClass } from "../lib/dashboard-surface"
import type { VendorDashboardOverview } from "../types"

type SalesOverviewCardProps = {
  salesSeries: VendorDashboardOverview["salesSeries"]
  rangeLabel: string
}

export function SalesOverviewCard({
  salesSeries,
  rangeLabel,
}: SalesOverviewCardProps) {
  const total = salesSeries.reduce((sum, point) => sum + point.grossSales, 0)

  const chartData = salesSeries.map((point) => ({
    label: formatBucketLabel(point.date, "day"),
    value: point.grossSales,
    title: `${formatBucketLabel(point.date, "day")}: ${formatCompactMoney(point.grossSales)} · ${point.orders} orders`,
  }))

  return (
    <article className={`p-4 sm:p-6 xl:col-span-3 ${dashboardPanelClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Sales</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Gross sales by day for the last {rangeLabel}.
          </p>
        </div>
        <p className="rounded-full bg-brand-soft px-3 py-1 text-sm font-semibold text-brand-text tabular-nums">
          {formatCompactMoney(total)}
        </p>
      </div>
      <div className="mt-6">
        <BarChart data={chartData} formatValue={formatCompactMoney} />
      </div>
    </article>
  )
}
