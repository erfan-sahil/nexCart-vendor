import type { VendorDashboardOverview } from "../types"

type DashboardOrderQueuesProps = {
  orderQueues: VendorDashboardOverview["orderQueues"]
}

export function DashboardOrderQueues({
  orderQueues,
}: DashboardOrderQueuesProps) {
  const items = [
    {
      label: "Needs action",
      value: orderQueues.actionNeeded,
      hint: "Pending acceptance",
    },
    {
      label: "In progress",
      value: orderQueues.inProgress,
      hint: "Before or at warehouse",
    },
    {
      label: "Shipped",
      value: orderQueues.shipped,
      hint: "Out for delivery",
    },
    {
      label: "Delivered",
      value: orderQueues.delivered,
      hint: "Completed slices",
    },
  ]

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <article
          key={item.label}
          className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm"
        >
          <p className="text-sm text-muted-foreground">{item.label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
            {item.value}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">{item.hint}</p>
        </article>
      ))}
    </section>
  )
}
