import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ApiError } from "@/lib/api/errors"

import { formatResultRange } from "../lib/format"

export function InventoryTableSkeleton() {
  return (
    <div className="divide-y divide-border" aria-hidden="true">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="flex items-center gap-3 px-4 py-4">
          <div className="size-10 animate-pulse rounded-lg bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-40 max-w-full animate-pulse rounded bg-muted" />
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function InventoryEmptyState({
  filtered,
  view,
}: {
  filtered: boolean
  view: "products" | "variants"
}) {
  const noun = view === "products" ? "products" : "variants"

  return (
    <div className="px-4 py-16 text-center">
      <p className="text-sm font-medium">
        {filtered ? `No matching ${noun}` : `No ${noun} yet`}
      </p>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        {filtered
          ? "Try a different search or clear the filters."
          : "Stock from your product catalog will show up here."}
      </p>
    </div>
  )
}

export function InventoryErrorState({
  error,
  onRetry,
}: {
  error: unknown
  onRetry: () => void
}) {
  const message =
    error instanceof ApiError
      ? error.message
      : "Inventory could not be loaded. Please try again."

  return (
    <div className="px-4 py-16 text-center" role="alert">
      <p className="text-sm font-medium">Could not load inventory</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        {message}
      </p>
      <Button
        type="button"
        variant="outline"
        className="mt-4"
        onClick={onRetry}
      >
        Try again
      </Button>
    </div>
  )
}

export function InventoryPagination({
  page,
  totalPages,
  total,
  limit,
  disabled,
  onPage,
}: {
  page: number
  totalPages: number
  total: number
  limit: number
  disabled: boolean
  onPage: (page: number) => void
}) {
  if (total === 0) {
    return null
  }

  return (
    <footer className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        {formatResultRange(page, limit, total)}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1 || disabled}
          onClick={() => onPage(page - 1)}
        >
          <ChevronLeft />
          Previous
        </Button>
        <p className="min-w-16 text-center text-xs text-muted-foreground">
          {page} / {Math.max(totalPages, 1)}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages || disabled}
          onClick={() => onPage(page + 1)}
        >
          Next
          <ChevronRight />
        </Button>
      </div>
    </footer>
  )
}
