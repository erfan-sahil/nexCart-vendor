import { KpiCard } from "@/components/shared/kpi-card"
import { formatMoney } from "@/lib/format"

import type { VendorDashboardOverview } from "../types"

type DashboardKpisProps = {
  kpis: VendorDashboardOverview["kpis"]
  rangeLabel: string
}

export function DashboardKpis({ kpis, rangeLabel }: DashboardKpisProps) {
  const cards = [
    {
      label: "Gross sales",
      value: formatMoney(kpis.grossSales.current),
      hint: `Last ${rangeLabel}`,
      metric: kpis.grossSales,
    },
    {
      label: "Net earnings",
      value: formatMoney(kpis.netEarnings.current),
      hint: "After commission",
      metric: kpis.netEarnings,
    },
    {
      label: "Orders",
      value: String(kpis.orders.current),
      hint: "Non-cancelled revenue orders",
      metric: kpis.orders,
    },
    {
      label: "Average order",
      value: formatMoney(kpis.averageOrderValue.current),
      hint: "Gross sales per order",
      metric: kpis.averageOrderValue,
    },
  ]

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <KpiCard key={card.label} {...card} />
      ))}
    </section>
  )
}
