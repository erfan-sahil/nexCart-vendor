import { PanelActionLink } from "./panel-action-link"
import { dashboardPanelClass } from "../lib/dashboard-surface"
import type { VendorDashboardOverview } from "../types"

type LowStockCardProps = {
  lowStock: VendorDashboardOverview["lowStock"]
  lowStockCount: number
}

export function LowStockCard({ lowStock, lowStockCount }: LowStockCardProps) {
  return (
    <article className={`p-4 sm:p-6 xl:col-span-2 ${dashboardPanelClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Low stock</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Variants close to selling out.
          </p>
        </div>
        {lowStockCount > lowStock.length ? (
          <PanelActionLink to="/store/inventory?stockLevel=low_stock">
            View all ({lowStockCount})
          </PanelActionLink>
        ) : null}
      </div>
      {lowStock.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          No low-stock variants right now.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {lowStock.map((item) => (
            <li
              key={item.variantId}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{item.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {item.sku}
                </p>
              </div>
              <span className="shrink-0 text-xs font-medium text-brand-text tabular-nums">
                {item.stock} left
              </span>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
