"use client"

import { useState } from "react"

import { RangeSelect } from "@/components/shared/range-select"

import { DashboardErrorState, DashboardSkeleton } from "./dashboard-states"
import { DashboardKpis } from "./dashboard-kpis"
import { DashboardOrderQueues } from "./dashboard-order-queues"
import { LowStockCard } from "./low-stock-card"
import { RecentOrdersCard } from "./recent-orders-card"
import { SalesOverviewCard } from "./sales-overview-card"
import { StoreRatingCard } from "./store-rating-card"
import { WalletCard } from "./wallet-card"
import { dashboardPanelClass } from "../lib/dashboard-surface"
import { useVendorDashboard } from "../hooks"
import { type VendorDashboardRange } from "../types"

const RANGE_OPTIONS = [
  { value: "7d" as const, label: "7 days" },
  { value: "30d" as const, label: "30 days" },
]

function rangeLabel(range: VendorDashboardRange) {
  return range === "7d" ? "7 days" : "30 days"
}

export function DashboardHome() {
  const [range, setRange] = useState<VendorDashboardRange>("7d")
  const query = useVendorDashboard(range)
  const overview = query.data

  if (query.isLoading && !overview) {
    return <DashboardSkeleton />
  }

  if (query.isError && !overview) {
    return (
      <DashboardErrorState
        error={query.error}
        onRetry={() => query.refetch()}
      />
    )
  }

  if (!overview) {
    return null
  }

  const label = rangeLabel(range)

  return (
    <div className="flex w-full flex-col gap-8">
      <header className={`flex justify-end p-5 sm:p-6 ${dashboardPanelClass}`}>
        <RangeSelect
          value={range}
          onValueChange={setRange}
          options={RANGE_OPTIONS}
          ariaLabel="Dashboard date range"
        />
      </header>

      <DashboardKpis kpis={overview.kpis} rangeLabel={label} />

      <DashboardOrderQueues orderQueues={overview.orderQueues} />

      <section className="grid gap-4 xl:grid-cols-5">
        <SalesOverviewCard
          salesSeries={overview.salesSeries}
          rangeLabel={label}
        />
        <LowStockCard
          lowStock={overview.lowStock}
          lowStockCount={overview.lowStockCount}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <WalletCard wallet={overview.wallet} />
        <StoreRatingCard
          average={overview.rating.average}
          count={overview.rating.count}
        />
      </section>

      <RecentOrdersCard recentOrders={overview.recentOrders} />
    </div>
  )
}
