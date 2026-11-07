import {
  Banknote,
  Package,
  Percent,
  Receipt,
  ShoppingBag,
  Wallet,
} from "lucide-react"

import { KpiCard } from "@/components/shared/kpi-card"
import { formatMoney } from "@/lib/format"

import type { VendorAnalytics } from "../types"

type AnalyticsKpisProps = {
  kpis: VendorAnalytics["kpis"]
  rangeLabel: string
}

export function AnalyticsKpis({ kpis, rangeLabel }: AnalyticsKpisProps) {
  const cards = [
    {
      label: "Gross sales",
      value: formatMoney(kpis.grossSales.current),
      hint: `Last ${rangeLabel}`,
      metric: kpis.grossSales,
      icon: Banknote,
      tone: "brand" as const,
    },
    {
      label: "Net earnings",
      value: formatMoney(kpis.netEarnings.current),
      hint: "After commission",
      metric: kpis.netEarnings,
      icon: Wallet,
      tone: "success" as const,
    },
    {
      label: "Orders",
      value: String(kpis.orders.current),
      hint: "Non-cancelled revenue orders",
      metric: kpis.orders,
      icon: ShoppingBag,
      tone: "info" as const,
    },
    {
      label: "Average order",
      value: formatMoney(kpis.averageOrderValue.current),
      hint: "Gross sales per order",
      metric: kpis.averageOrderValue,
      icon: Receipt,
      tone: "violet" as const,
    },
    {
      label: "Units sold",
      value: String(kpis.unitsSold.current),
      hint: "Line item quantities",
      metric: kpis.unitsSold,
      icon: Package,
      tone: "info" as const,
    },
    {
      label: "Commission",
      value: formatMoney(kpis.commission.current),
      hint: "Platform fees in period",
      metric: kpis.commission,
      icon: Percent,
      tone: "violet" as const,
    },
  ]

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <KpiCard key={card.label} {...card} />
      ))}
    </section>
  )
}
