import {
  CircleCheck,
  Package,
  PackageX,
  TriangleAlert,
  Warehouse,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ApiError } from "@/lib/api/errors"
import { cn } from "@/lib/utils"

import { STOCK_LEVEL_LABEL } from "../constants"
import { formatCount, formatUnits } from "../lib/format"
import type { InventorySummary } from "../types"

type Tone = "brand" | "success" | "warning" | "danger" | "info"

const TONE: Record<Tone, string> = {
  brand: "bg-brand-soft text-brand-text",
  success:
    "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  warning:
    "bg-amber-500/10 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-sky-500/10 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
}

type InventorySummaryBarProps = {
  summary: InventorySummary | undefined
  isPending: boolean
  error: unknown
  onRetry: () => void
}

export function InventorySummaryBar({
  summary,
  isPending,
  error,
  onRetry,
}: InventorySummaryBarProps) {
  if (isPending && !summary) {
    return (
      <div
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"
        aria-hidden="true"
      >
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="h-[6.25rem] animate-pulse rounded-xl bg-muted"
          />
        ))}
      </div>
    )
  }

  if (!summary) {
    const message =
      error instanceof ApiError
        ? error.message
        : "The stock summary could not be loaded."

    return (
      <div
        role="alert"
        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm"
      >
        <p>{message}</p>
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <SummaryCard
        icon={Package}
        tone="brand"
        label="Products"
        value={formatCount(summary.productCount)}
        detail={`${formatCount(summary.variantCount)} variants`}
      />
      <SummaryCard
        icon={CircleCheck}
        tone="success"
        label={STOCK_LEVEL_LABEL.in_stock}
        value={formatCount(summary.products.inStock)}
        detail={`${formatCount(summary.variants.inStock)} variants`}
      />
      <SummaryCard
        icon={TriangleAlert}
        tone="warning"
        label={STOCK_LEVEL_LABEL.low_stock}
        value={formatCount(summary.products.lowStock)}
        detail={`At or below ${formatUnits(summary.lowStockAt)}`}
      />
      <SummaryCard
        icon={PackageX}
        tone="danger"
        label={STOCK_LEVEL_LABEL.out_of_stock}
        value={formatCount(summary.products.outOfStock)}
        detail={`${formatCount(summary.variants.outOfStock)} variants`}
      />
      <SummaryCard
        icon={Warehouse}
        tone="info"
        label="Sellable units"
        value={formatCount(summary.sellableUnits)}
        detail={`${formatUnits(summary.totalUnits)} on hand`}
      />
    </div>
  )
}

function SummaryCard({
  icon,
  tone,
  label,
  value,
  detail,
}: {
  icon: LucideIcon
  tone: Tone
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
      <StatCopy label={label} value={value} detail={detail} />
      <StatIcon icon={icon} tone={tone} />
    </div>
  )
}

function StatCopy({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <span className="min-w-0">
      <span className="block text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <span className="mt-2 block text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </span>
      <span className="mt-1 block truncate text-xs text-muted-foreground">
        {detail}
      </span>
    </span>
  )
}

function StatIcon({ icon: Icon, tone }: { icon: LucideIcon; tone: Tone }) {
  return (
    <span
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-lg",
        TONE[tone]
      )}
    >
      <Icon className="size-5" aria-hidden="true" />
    </span>
  )
}
