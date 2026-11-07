import { Button } from "@/components/ui/button"
import { ApiError } from "@/lib/api/errors"

import { analyticsPanelClass } from "../lib/analytics-surface"

export function AnalyticsSkeleton() {
  return (
    <div
      className="mx-auto flex w-full max-w-6xl flex-col gap-8"
      aria-hidden="true"
    >
      <div className={`h-36 animate-pulse ${analyticsPanelClass}`} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className={`h-36 animate-pulse ${analyticsPanelClass}`}
          />
        ))}
      </div>
      <div className={`h-96 animate-pulse ${analyticsPanelClass}`} />
      <div className="grid gap-4 xl:grid-cols-2">
        <div className={`h-72 animate-pulse ${analyticsPanelClass}`} />
        <div className={`h-72 animate-pulse ${analyticsPanelClass}`} />
      </div>
    </div>
  )
}

export function AnalyticsErrorState({
  error,
  onRetry,
}: {
  error: unknown
  onRetry: () => void
}) {
  const message =
    error instanceof ApiError
      ? error.message
      : "Analytics could not be loaded. Please try again."

  return (
    <div
      className={`mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-16 text-center ${analyticsPanelClass}`}
      role="alert"
    >
      <p className="text-sm font-medium">Could not load analytics</p>
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

export function AnalyticsEmptyState() {
  return (
    <div
      className={`border-dashed bg-muted/20 px-6 py-12 text-center ${analyticsPanelClass}`}
    >
      <p className="text-sm font-medium">No sales in this period</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        When orders come in for this range, revenue and product metrics will
        appear here.
      </p>
    </div>
  )
}
