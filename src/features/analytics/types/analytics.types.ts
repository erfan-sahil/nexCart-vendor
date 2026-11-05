import type { PeriodMetric } from "@/components/shared/kpi-card"

export const VENDOR_ANALYTICS_RANGES = ["7d", "30d", "90d", "12m"] as const
export type VendorAnalyticsRange = (typeof VENDOR_ANALYTICS_RANGES)[number]

export type VendorAnalytics = {
  range: VendorAnalyticsRange
  bucket: "day" | "month"
  generatedAt: string
  kpis: {
    grossSales: PeriodMetric
    netEarnings: PeriodMetric
    orders: PeriodMetric
    averageOrderValue: PeriodMetric
    unitsSold: PeriodMetric
    commission: PeriodMetric
  }
  series: {
    date: string
    grossSales: number
    netEarnings: number
    orders: number
  }[]
  statusBreakdown: { status: string; count: number }[]
  fulfillment: {
    cancellationRate: number
    warehouseRejectionRate: number
    deliveryRate: number
    returnRate: number
  }
  topProducts: {
    productId: string
    name: string
    unitsSold: number
    grossSales: number
    sharePercent: number
  }[]
  reviews: {
    average: number | null
    total: number
    newInRange: number
    distribution: { rating: 1 | 2 | 3 | 4 | 5; count: number }[]
  }
}
