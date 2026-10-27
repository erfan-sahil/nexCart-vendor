import {
  Boxes,
  CircleCheck,
  CircleX,
  Package,
  TriangleAlert,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ApiError } from "@/lib/api/errors"
import { cn } from "@/lib/utils"

import { STOCK_LEVEL_LABEL } from "../constants"
import { formatCount, formatUnits } from "../lib/format"
import type { InventorySummary, StockLevel } from "../types"

type InventorySummaryBarProps = {
  summary: InventorySummary | undefined
  isPending: boolean
  error: unknown
  stockLevel: StockLevel | undefined
  onStockLevel: (stockLevel: StockLevel | undefined) => void
  onRetry: () => void
}

export function InventorySummaryBar({
  summary,
  isPending,
  error,
  stockLevel,
  onStockLevel,
  onRetry,
}: InventorySummaryBarProps) {
  if (isPending && !summary) {
    return (
      <div
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"
        aria-hidden="true"
      >
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-xl bg-muted" />
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
      <SummaryStat
        icon={Package}
        label="Products"
        value={formatCount(summary.productCount)}
        detail={`${formatCount(summary.variantCount)} variants`}
        pressed={stockLevel === undefined}
        onClick={() => onStockLevel(undefined)}
      />
      <SummaryStat
        icon={CircleCheck}
        label={STOCK_LEVEL_LABEL.in_stock}
        value={formatCount(summary.products.inStock)}
        detail={`${formatCount(summary.variants.inStock)} variants`}
        pressed={stockLevel === "in_stock"}
        onClick={() => onStockLevel("in_stock")}
      />
      <SummaryStat
        icon={TriangleAlert}
        label={STOCK_LEVEL_LABEL.low_stock}
        value={formatCount(summary.products.lowStock)}
        detail={`At or below ${formatUnits(summary.lowStockAt)}`}
        pressed={stockLevel === "low_stock"}
        onClick={() => onStockLevel("low_stock")}
      />
      <SummaryStat
        icon={CircleX}
        label={STOCK_LEVEL_LABEL.out_of_stock}
        value={formatCount(summary.products.outOfStock)}
        detail={`${formatCount(summary.variants.outOfStock)} variants`}
        pressed={stockLevel === "out_of_stock"}
        onClick={() => onStockLevel("out_of_stock")}
      />
      <div className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Boxes className="size-3.5" aria-hidden="true" />
          Sellable units
        </div>
        <p className="mt-2 text-2xl font-semibold tracking-tight">
          {formatCount(summary.sellableUnits)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatUnits(summary.totalUnits)} on hand
        </p>
      </div>
    </div>
  )
}

function SummaryStat({
  icon: Icon,
  label,
  value,
  detail,
  pressed,
  onClick,
}: {
  icon: typeof Package
  label: string
  value: string
  detail: string
  pressed: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "rounded-xl border border-border bg-card p-4 text-left text-card-foreground shadow-sm transition-colors hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        pressed && "border-primary ring-1 ring-primary"
      )}
    >
      <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5" aria-hidden="true" />
        {label}
      </span>
      <span className="mt-2 block text-2xl font-semibold tracking-tight">
        {value}
      </span>
      <span className="mt-1 block text-xs text-muted-foreground">{detail}</span>
    </button>
  )
}
