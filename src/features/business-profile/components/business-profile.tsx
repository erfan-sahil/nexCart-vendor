import { Button } from "@/components/ui/button"
import { ApiError } from "@/lib/api/errors"

import { useMyBusinessProfile } from "../hooks"
import { BusinessProfileView } from "./business-profile-view"

function BusinessProfileSkeleton() {
  return (
    <div className="flex w-full flex-col gap-4" aria-hidden="true">
      <div className="h-64 animate-pulse rounded-xl bg-muted" />
    </div>
  )
}

function BusinessProfileError({
  error,
  onRetry,
}: {
  error: unknown
  onRetry: () => void
}) {
  const message =
    error instanceof ApiError
      ? error.message
      : "Business profile could not be loaded. Please try again."

  return (
    <div
      className="w-full rounded-xl border border-border bg-card px-4 py-16 text-center"
      role="alert"
    >
      <p className="text-sm font-medium">Could not load business profile</p>
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

export function BusinessProfile() {
  const profile = useMyBusinessProfile()

  if (profile.isPending) {
    return <BusinessProfileSkeleton />
  }

  if (profile.isError || !profile.data) {
    return (
      <BusinessProfileError
        error={profile.error}
        onRetry={() => {
          void profile.refetch()
        }}
      />
    )
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <BusinessProfileView application={profile.data} />
    </div>
  )
}
