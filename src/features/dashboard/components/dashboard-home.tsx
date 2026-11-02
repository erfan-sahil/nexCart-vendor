"use client"

import { Loader2 } from "lucide-react"

import {
  useVendorOrderSummary,
  useVendorOrders,
} from "@/features/orders/hooks/use-vendor-orders"
import { SALES, STOCK } from "../data/dashboard"

export function DashboardHome() {
  const summaryQuery = useVendorOrderSummary()
  const recentQuery = useVendorOrders({ limit: 5, sort: "-createdAt" })
  const summary = summaryQuery.data

  const stats = [
    {
      label: "Total orders",
      value: summary ? String(summary.total) : "—",
      change: "Live",
      hint: "All vendor orders",
    },
    {
      label: "Pending",
      value: summary ? String(summary.pending) : "—",
      change: "Awaiting accept",
      hint: "Need your action",
    },
    {
      label: "Preparing",
      value: summary
        ? String(summary.accepted + summary.preparing + summary.readyToShip)
        : "—",
      change: "In progress",
      hint: "Before inbound ship",
    },
    {
      label: "Completed",
      value: summary ? String(summary.completed) : "—",
      change: "Fulfilled",
      hint: "Delivered slices",
    },
  ]

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {stat.value}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              <span className="font-medium text-brand-text">{stat.change}</span>
              <span className="px-1.5">·</span>
              {stat.hint}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        <article className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5 xl:col-span-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Sales this week</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Sample snapshot until live store orders are connected.
              </p>
            </div>
            <p className="text-sm font-medium text-brand-text">$6.8k</p>
          </div>
          <div className="mt-6 flex h-44 items-end gap-2 sm:gap-3">
            {SALES.map((point) => (
              <div
                key={point.label}
                className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2"
              >
                <div className="flex h-36 items-end">
                  <div
                    className="w-full rounded-md bg-primary"
                    style={{
                      height: `${point.share}%`,
                      backgroundImage:
                        "linear-gradient(to top, var(--brand-deep), var(--brand))",
                    }}
                    title={`${point.label} ${point.amount}`}
                  />
                </div>
                <span className="truncate text-center text-[11px] text-muted-foreground">
                  {point.label}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5 xl:col-span-2">
          <h2 className="text-sm font-semibold">Low stock</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Products close to selling out.
          </p>
          <ul className="mt-4 divide-y divide-border">
            {STOCK.map((item) => (
              <li
                key={item.sku}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.product}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.sku}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-medium text-brand-text">
                  {item.left}
                </span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <div className="border-b border-border px-4 py-4 sm:px-5">
          <h2 className="text-sm font-semibold">Recent orders</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Latest orders for this store.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-4 py-3 font-medium sm:px-5">Order</th>
                <th className="px-4 py-3 font-medium">Buyer</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium sm:px-5">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentQuery.isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center sm:px-5">
                    <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
                  </td>
                </tr>
              ) : (recentQuery.data?.items ?? []).length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-muted-foreground sm:px-5"
                  >
                    No orders yet.
                  </td>
                </tr>
              ) : (
                (recentQuery.data?.items ?? []).map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3 font-medium sm:px-5">
                      {order.vendorOrderNumber}
                    </td>
                    <td className="px-4 py-3">—</td>
                    <td className="px-4 py-3">
                      BDT {order.itemsSubtotal.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 sm:px-5">
                      <span className="inline-flex rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
