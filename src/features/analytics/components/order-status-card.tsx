import { StackedBar } from "@/components/charts"
import { vendorOrderStatusLabel } from "@/features/orders/lib/normalize-order-status"

import { analyticsPanelClass } from "../lib/analytics-surface"
import type { VendorAnalytics } from "../types"

type OrderStatusCardProps = {
  statusBreakdown: VendorAnalytics["statusBreakdown"]
}

export function OrderStatusCard({ statusBreakdown }: OrderStatusCardProps) {
  const segments = [...statusBreakdown]
    .sort((a, b) => b.count - a.count)
    .map((row) => ({
      key: row.status,
      label: vendorOrderStatusLabel(row.status),
      value: row.count,
    }))

  const total = segments.reduce((sum, segment) => sum + segment.value, 0)

  return (
    <article className={`p-4 sm:p-6 ${analyticsPanelClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Order status</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            How vendor orders were distributed in this period.
          </p>
        </div>
        <p className="rounded-full bg-muted/60 px-3 py-1 text-sm font-semibold tabular-nums ring-1 ring-border/80">
          {total}
        </p>
      </div>
      <div className="mt-6">
        <StackedBar segments={segments} />
      </div>
    </article>
  )
}
