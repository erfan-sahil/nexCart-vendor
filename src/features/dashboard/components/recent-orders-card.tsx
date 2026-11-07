import { ChevronRight } from "lucide-react"
import { Link } from "react-router"

import { OrderStatusBadge } from "@/features/orders/components/order-status-badge"
import { formatItemCount } from "@/features/orders/lib/format"
import { Button } from "@/components/ui/button"
import { formatMoney } from "@/lib/format"

import { dashboardPanelClass } from "../lib/dashboard-surface"
import type { VendorDashboardOverview } from "../types"

type RecentOrdersCardProps = {
  recentOrders: VendorDashboardOverview["recentOrders"]
}

export function RecentOrdersCard({ recentOrders }: RecentOrdersCardProps) {
  return (
    <section className={dashboardPanelClass}>
      <div className="flex items-start justify-between gap-3 border-b border-border/80 px-4 py-4 sm:px-6">
        <div>
          <h2 className="text-sm font-semibold">Recent orders</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Latest orders for this store.
          </p>
        </div>
        <Button
          variant="outline"
          size="xs"
          className="shrink-0 border-border/80 text-foreground shadow-none"
          asChild
        >
          <Link to="/orders">
            View all
            <ChevronRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr className="border-b border-border">
              <th className="px-4 py-3 font-medium sm:px-5">Order</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium sm:px-5">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-muted-foreground sm:px-5"
                >
                  No orders yet.
                </td>
              </tr>
            ) : (
              recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3 font-medium sm:px-5">
                    {order.vendorOrderNumber}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatItemCount(order.itemCount)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatMoney(order.itemsSubtotal)}
                  </td>
                  <td className="px-4 py-3 sm:px-5">
                    <OrderStatusBadge status={order.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
