import { Button } from "@/components/ui/button"
import { ApiError } from "@/lib/api/errors"

export function ProductTableSkeleton() {
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

export function ProductEmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="px-4 py-16 text-center">
      <p className="text-sm font-medium">
        {filtered ? "No matching products" : "No products yet"}
      </p>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        {filtered
          ? "Try a different search or clear the filters."
          : "Products you add to this store will show up here."}
      </p>
    </div>
  )
}

export function ProductErrorState({
  error,
  onRetry,
}: {
  error: unknown
  onRetry: () => void
}) {
  const message =
    error instanceof ApiError
      ? error.message
      : "Products could not be loaded. Please try again."

  return (
    <div className="px-4 py-16 text-center" role="alert">
      <p className="text-sm font-medium">Could not load products</p>
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
