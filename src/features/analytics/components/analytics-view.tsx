"use client"

import { RangeSelect } from "@/components/shared/range-select"

import {
  AnalyticsEmptyState,
  AnalyticsErrorState,
  AnalyticsSkeleton,
} from "./analytics-states"
import { AnalyticsKpis } from "./analytics-kpis"
import { FulfillmentHealthCard } from "./fulfillment-health-card"
import { OrderStatusCard } from "./order-status-card"
import { RevenueTrendCard } from "./revenue-trend-card"
import { ReviewsSummaryCard } from "./reviews-summary-card"
import { TopProductsCard } from "./top-products-card"
import { useAnalyticsRange, useVendorAnalytics } from "../hooks"
import type { VendorAnalyticsRange } from "../types"

const RANGE_OPTIONS = [
  { value: "7d" as const, label: "7 days" },
  { value: "30d" as const, label: "30 days" },
  { value: "90d" as const, label: "90 days" },
  { value: "12m" as const, label: "12 months" },
]

function rangeLabel(range: VendorAnalyticsRange) {
  switch (range) {
    case "7d":
      return "7 days"
    case "30d":
      return "30 days"
    case "90d":
      return "90 days"
    case "12m":
      return "12 months"
  }
}

export function AnalyticsView() {
  const { range, setRange } = useAnalyticsRange()
  const query = useVendorAnalytics(range)
  const data = query.data

  if (query.isLoading && !data) {
    return <AnalyticsSkeleton />
  }

  if (query.isError && !data) {
    return (
      <AnalyticsErrorState
        error={query.error}
        onRetry={() => query.refetch()}
      />
    )
  }

  if (!data) {
    return null
  }

  const label = rangeLabel(range)
  const noSales =
    data.kpis.grossSales.current === 0 && data.kpis.orders.current === 0

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Sales, product, and fulfillment performance for the last {label}.
        </p>
        <RangeSelect
          value={range}
          onValueChange={setRange}
          options={RANGE_OPTIONS}
          ariaLabel="Analytics date range"
        />
      </div>

      <AnalyticsKpis kpis={data.kpis} rangeLabel={label} />

      {noSales ? <AnalyticsEmptyState /> : null}

      <RevenueTrendCard series={data.series} bucket={data.bucket} />

      <section className="grid gap-4 xl:grid-cols-2">
        <OrderStatusCard statusBreakdown={data.statusBreakdown} />
        <FulfillmentHealthCard fulfillment={data.fulfillment} />
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <TopProductsCard topProducts={data.topProducts} />
        </div>
        <div className="xl:col-span-2">
          <ReviewsSummaryCard reviews={data.reviews} />
        </div>
      </section>
    </div>
  )
}
