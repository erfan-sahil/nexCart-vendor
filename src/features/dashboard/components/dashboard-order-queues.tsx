import {
  CheckCircle2,
  Package,
  PackageCheck,
  Timer,
  type AppIcon,
} from "@/lib/icons"

import { cn } from "@/lib/utils"

import { dashboardPanelClass } from "../lib/dashboard-surface"
import type { VendorDashboardOverview } from "../types"

type DashboardOrderQueuesProps = {
  orderQueues: VendorDashboardOverview["orderQueues"]
}

type QueueTone = "warning" | "info" | "brand" | "success"

const ICON_TONE: Record<QueueTone, string> = {
  warning:
    "bg-amber-500/10 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200",
  info: "bg-sky-500/10 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  brand: "bg-brand-soft text-brand-text",
  success:
    "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
}

export function DashboardOrderQueues({
  orderQueues,
}: DashboardOrderQueuesProps) {
  const items: {
    label: string
    value: number
    hint: string
    icon: AppIcon
    tone: QueueTone
  }[] = [
    {
      label: "Needs action",
      value: orderQueues.actionNeeded,
      hint: "Pending acceptance",
      icon: Timer,
      tone: "warning",
    },
    {
      label: "In progress",
      value: orderQueues.inProgress,
      hint: "Before or at warehouse",
      icon: Package,
      tone: "info",
    },
    {
      label: "Shipped",
      value: orderQueues.shipped,
      hint: "Out for delivery",
      icon: PackageCheck,
      tone: "brand",
    },
    {
      label: "Delivered",
      value: orderQueues.delivered,
      hint: "Completed slices",
      icon: CheckCircle2,
      tone: "success",
    },
  ]

  return (
    <section className={dashboardPanelClass}>
      <div className="border-b border-border/80 px-5 py-4 sm:px-6">
        <h2 className="text-sm font-semibold">Order pipeline</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Live counts across fulfillment stages.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item, index) => (
          <div
            key={item.label}
            className={cn(
              "flex gap-4 px-5 py-5 sm:px-6",
              index > 0 && "border-t border-border/80 sm:border-t-0",
              index > 0 && "xl:border-t-0 xl:border-l xl:border-border/80"
            )}
          >
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl",
                ICON_TONE[item.tone]
              )}
            >
              <item.icon className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
                {item.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
