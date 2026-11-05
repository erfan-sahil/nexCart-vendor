import { Button } from "@/components/ui/button"
import { ApiError } from "@/lib/api/errors"

export function DashboardSkeleton() {
  return (
    <div
      className="mx-auto flex w-full max-w-6xl flex-col gap-6"
      aria-hidden="true"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-xl border border-border bg-muted/40"
          />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-5">
        <div className="h-64 animate-pulse rounded-xl border border-border bg-muted/40 xl:col-span-3" />
        <div className="h-64 animate-pulse rounded-xl border border-border bg-muted/40 xl:col-span-2" />
      </div>
      <div className="h-72 animate-pulse rounded-xl border border-border bg-muted/40" />
    </div>
  )
}

export function DashboardErrorState({
  error,
  onRetry,
}: {
  error: unknown
  onRetry: () => void
}) {
  const message =
    error instanceof ApiError
      ? error.message
      : "Dashboard could not be loaded. Please try again."

  return (
    <div
      className="mx-auto flex w-full max-w-6xl flex-col items-center rounded-xl border border-border bg-card px-6 py-16 text-center shadow-sm"
      role="alert"
    >
      <p className="text-sm font-medium">Could not load dashboard</p>
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
