import { formatPercent } from "@/lib/format"

import { analyticsPanelClass } from "../lib/analytics-surface"
import type { VendorAnalytics } from "../types"

type FulfillmentHealthCardProps = {
  fulfillment: VendorAnalytics["fulfillment"]
}

export function FulfillmentHealthCard({
  fulfillment,
}: FulfillmentHealthCardProps) {
  const tiles = [
    {
      label: "Cancellation rate",
      value: fulfillment.cancellationRate,
      hint: "Orders cancelled",
    },
    {
      label: "Warehouse rejection",
      value: fulfillment.warehouseRejectionRate,
      hint: "Rejected at warehouse",
    },
    {
      label: "Delivery rate",
      value: fulfillment.deliveryRate,
      hint: "Reached delivered",
    },
    {
      label: "Return rate",
      value: fulfillment.returnRate,
      hint: "Returns vs delivered",
    },
  ]

  return (
    <article className={`p-4 sm:p-6 ${analyticsPanelClass}`}>
      <h2 className="text-sm font-semibold">Fulfillment health</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Share of orders in this period by outcome.
      </p>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className="rounded-xl border border-border/80 bg-muted/25 p-4 ring-1 ring-black/[0.02] dark:ring-white/[0.04]"
          >
            <dt className="text-xs text-muted-foreground">{tile.label}</dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums">
              {formatPercent(tile.value, 1).replace("+", "")}
            </dd>
            <dd className="mt-1 text-[11px] text-muted-foreground">
              {tile.hint}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  )
}
