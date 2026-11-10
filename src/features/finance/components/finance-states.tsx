import { ChevronLeft, ChevronRight } from "@/lib/icons"

import { Button } from "@/components/ui/button"
import { TableSkeletonHeader } from "@/components/ui/table"
import { ApiError } from "@/lib/api/errors"

import { formatListRange, formatTransactionRange } from "../lib/format"

export function FinanceSummarySkeleton() {
  return (
    <div
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      aria-hidden="true"
    >
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="h-[7.5rem] animate-pulse rounded-xl bg-muted"
        />
      ))}
    </div>
  )
}

export function FinanceTableSkeleton() {
  return (
    <div aria-hidden="true">
      <TableSkeletonHeader columns={5} />
      <div className="divide-y divide-border">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex items-center gap-4 px-4 py-4">
            <div className="size-9 shrink-0 animate-pulse rounded-lg bg-muted" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3.5 w-36 max-w-full animate-pulse rounded bg-muted" />
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            </div>
            <div className="hidden h-3 w-28 animate-pulse rounded bg-muted lg:block" />
            <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function FinanceErrorState({
  title,
  error,
  onRetry,
}: {
  title: string
  error: unknown
  onRetry: () => void
}) {
  const message =
    error instanceof ApiError
      ? error.message
      : "Something went wrong. Please try again."

  return (
    <div
      role="alert"
      className="flex flex-col items-center rounded-xl border border-border bg-card px-4 py-12 text-center"
    >
      <p className="text-sm font-medium">{title}</p>
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

export function FinanceEmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="px-4 py-16 text-center">
      <p className="text-sm font-medium">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

export function FinancePagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  disabled,
  itemNoun = "transactions",
}: {
  page: number
  totalPages: number
  total: number
  limit: number
  onPageChange: (page: number) => void
  disabled?: boolean
  itemNoun?: string
}) {
  const rangeLabel =
    itemNoun === "transactions"
      ? formatTransactionRange(page, limit, total)
      : formatListRange(page, limit, total, itemNoun)

  if (totalPages <= 1) {
    return <p className="text-xs text-muted-foreground">{rangeLabel}</p>
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-muted-foreground">{rangeLabel}</p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
