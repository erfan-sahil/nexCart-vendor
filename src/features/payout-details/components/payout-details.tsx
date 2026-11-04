import { Button } from "@/components/ui/button"
import { useMyStore } from "@/features/store/hooks"
import { ApiError } from "@/lib/api/errors"

import { PayoutDetailsForm } from "./payout-details-form"

function PayoutDetailsSkeleton() {
  return (
    <div
      className="h-96 animate-pulse rounded-xl bg-muted"
      aria-hidden="true"
    />
  )
}

function PayoutDetailsError({
  error,
  onRetry,
}: {
  error: unknown
  onRetry: () => void
}) {
  const message =
    error instanceof ApiError
      ? error.message
      : "Payout details could not be loaded. Please try again."

  return (
    <div
      className="rounded-xl border border-border bg-card px-4 py-16 text-center"
      role="alert"
    >
      <p className="text-sm font-medium">Could not load payout details</p>
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

export function PayoutDetails() {
  const store = useMyStore()

  if (store.isPending) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <PayoutDetailsSkeleton />
      </div>
    )
  }

  if (store.isError || !store.data) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <PayoutDetailsError
          error={store.error}
          onRetry={() => {
            void store.refetch()
          }}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <header>
        <h1 className="text-lg font-medium">Payout details</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Where withdrawal transfers are sent after you request a payout from
          Finance.
        </p>
      </header>
      <PayoutDetailsForm store={store.data} />
    </div>
  )
}
