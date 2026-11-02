import { Button } from "@/components/ui/button"
import { ApiError } from "@/lib/api/errors"

export function OrderTableSkeleton() {
  return (
    <div className="divide-y divide-border" aria-hidden="true">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="flex items-center gap-3 px-4 py-4">
          <div className="flex-1 space-y-2">
            <div className="h-3 w-40 max-w-full animate-pulse rounded bg-muted" />
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}

export function OrderEmptyState({
  filtered,
  message,
}: {
  filtered: boolean
  message?: string
}) {
  return (
    <div className="px-4 py-16 text-center">
      <p className="text-sm font-medium">
        {message ?? (filtered ? "No matching orders" : "No orders yet")}
      </p>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        {filtered
          ? "Try a different search or clear the filters."
          : "Orders assigned to your store will show up here."}
      </p>
    </div>
  )
}

export function OrderErrorState({
  error,
  onRetry,
}: {
  error: unknown
  onRetry: () => void
}) {
  const message =
    error instanceof ApiError
      ? error.message
      : "Orders could not be loaded. Please try again."

  return (
    <div className="px-4 py-16 text-center" role="alert">
      <p className="text-sm font-medium">Could not load orders</p>
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
