import { StackedBar } from "@/components/charts"
import { vendorOrderStatusLabel } from "@/features/orders/lib/normalize-order-status"

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

  return (
    <article className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5">
      <h2 className="text-sm font-semibold">Order status</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        How vendor orders were distributed in this period.
      </p>
      <div className="mt-6">
        <StackedBar segments={segments} />
      </div>
    </article>
  )
}
