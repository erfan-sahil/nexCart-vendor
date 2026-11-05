import type { PeriodMetric } from "@/components/shared/kpi-card"

export const VENDOR_DASHBOARD_RANGES = ["7d", "30d"] as const
export type VendorDashboardRange = (typeof VENDOR_DASHBOARD_RANGES)[number]

export type VendorDashboardOverview = {
  range: VendorDashboardRange
  generatedAt: string
  kpis: {
    grossSales: PeriodMetric
    netEarnings: PeriodMetric
    orders: PeriodMetric
    averageOrderValue: PeriodMetric
  }
  salesSeries: { date: string; grossSales: number; orders: number }[]
  orderQueues: {
    actionNeeded: number
    inProgress: number
    shipped: number
    delivered: number
  }
  wallet: { availableBalance: number; pendingSettlement: number }
  lowStock: {
    productId: string
    variantId: string
    name: string
    sku: string
    stock: number
  }[]
  lowStockCount: number
  rating: { average: number | null; count: number }
  recentOrders: {
    id: string
    vendorOrderNumber: string
    createdAt: string
    itemsSubtotal: number
    itemCount: number
    status: string
  }[]
}
