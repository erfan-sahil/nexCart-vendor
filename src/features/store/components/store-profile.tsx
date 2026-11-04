import { CircleCheck, CircleOff, ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared"
import { ApiError } from "@/lib/api/errors"
import { resolveAssetUrl } from "@/lib/api/assets"

import { useMyStore } from "../hooks"
import {
  formatCount,
  formatJoined,
  formatRating,
  formatSales,
} from "../lib/format"
import type { VendorStore } from "../types"

import { StoreProfileForm } from "./store-profile-form"

function StoreProfileSkeleton() {
  return (
    <div className="flex w-full flex-col gap-4" aria-hidden="true">
      <div className="h-56 animate-pulse rounded-xl bg-muted" />
      <div className="h-96 animate-pulse rounded-xl bg-muted" />
    </div>
  )
}

function StoreProfileError({
  error,
  onRetry,
}: {
  error: unknown
  onRetry: () => void
}) {
  const message =
    error instanceof ApiError
      ? error.message
      : "The store could not be loaded. Please try again."

  return (
    <div
      className="w-full rounded-xl border border-border bg-card px-4 py-16 text-center"
      role="alert"
    >
      <p className="text-sm font-medium">Could not load the store</p>
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/60 px-3 py-2.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-medium">{value}</p>
    </div>
  )
}

function StoreOverview({ store }: { store: VendorStore }) {
  const logo = store.logo ? resolveAssetUrl(store.logo) : ""
  const banner = store.banner ? resolveAssetUrl(store.banner) : ""
  const categoryCount = formatCount(store.categories.length)

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <div className="relative h-36 bg-muted sm:h-44">
        {banner ? (
          <img src={banner} alt="" className="size-full object-cover" />
        ) : null}
      </div>
      <div className="px-4 pb-4 sm:px-5">
        <div className="-mt-8 flex flex-col gap-3 sm:-mt-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 items-end gap-3">
            <div className="size-16 shrink-0 overflow-hidden rounded-xl border-4 border-card bg-muted sm:size-20">
              {logo ? (
                <img src={logo} alt="" className="size-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0 pb-0.5">
              <h2 className="truncate text-lg font-medium sm:text-xl">
                {store.name}
              </h2>
              <p className="truncate text-sm text-muted-foreground">
                /{store.slug}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pb-0.5">
            {store.isSuspended ? (
              <StatusBadge icon={ShieldAlert} tone="danger">
                Suspended
              </StatusBadge>
            ) : null}
            <StatusBadge
              icon={store.isActive ? CircleCheck : CircleOff}
              tone={store.isActive ? "success" : "neutral"}
            >
              {store.isActive ? "Open" : "Closed"}
            </StatusBadge>
          </div>
        </div>

        {store.isSuspended ? (
          <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            This store is suspended and hidden from shoppers until an
            administrator lifts the suspension.
          </p>
        ) : null}

        <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <Metric
            label="Rating"
            value={formatRating(store.rating.average, store.rating.count)}
          />
          <Metric label="Products" value={formatCount(store.totalProducts)} />
          <Metric label="Orders" value={formatCount(store.totalOrders)} />
          <Metric label="Sales" value={formatSales(store.totalSales)} />
          <Metric label="Joined" value={formatJoined(store.joinedAt)} />
          <Metric label="Categories" value={categoryCount} />
        </dl>
      </div>
    </section>
  )
}

export function StoreProfile() {
  const store = useMyStore()

  if (store.isPending) {
    return <StoreProfileSkeleton />
  }

  if (store.isError || !store.data) {
    return (
      <StoreProfileError
        error={store.error}
        onRetry={() => {
          void store.refetch()
        }}
      />
    )
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <StoreOverview store={store.data} />
      <StoreProfileForm store={store.data} />
    </div>
  )
}
