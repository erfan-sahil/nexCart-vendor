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
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="h-40 animate-pulse bg-muted sm:h-48" />
        <div className="space-y-4 px-4 py-5 sm:px-6">
          <div className="-mt-10 flex items-end gap-4">
            <div className="size-20 animate-pulse rounded-2xl bg-muted sm:size-24" />
            <div className="space-y-2 pb-1">
              <div className="h-6 w-40 animate-pulse rounded bg-muted" />
              <div className="h-4 w-56 animate-pulse rounded bg-muted" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="h-14 animate-pulse rounded-lg bg-muted/60"
              />
            ))}
          </div>
        </div>
      </div>
      <div className="h-96 animate-pulse rounded-xl border border-border bg-muted/40" />
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
  const initial = store.name.trim().slice(0, 1).toUpperCase() || "?"

  return (
    <section className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <div className="relative h-40 overflow-hidden rounded-t-xl bg-muted sm:h-48">
        {banner ? (
          <img
            src={banner}
            alt=""
            className="size-full object-cover"
            decoding="async"
          />
        ) : (
          <div
            aria-hidden
            className="size-full bg-linear-to-br from-muted via-muted/80 to-muted/40"
          />
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-card/80 to-transparent sm:h-20"
        />
      </div>

      <div className="px-4 pb-5 sm:px-6 sm:pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
            <div className="relative z-10 -mt-10 flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted shadow-sm ring-4 ring-card sm:-mt-12 sm:size-24">
              {logo ? (
                <img
                  src={logo}
                  alt=""
                  className="size-full object-cover"
                  decoding="async"
                />
              ) : (
                <span className="text-2xl font-semibold text-muted-foreground sm:text-3xl">
                  {initial}
                </span>
              )}
            </div>
            <div className="min-w-0 sm:pb-1">
              <h2 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
                {store.name}
              </h2>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                /stores/{store.slug}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:pb-1">
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
          <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            This store is suspended and hidden from shoppers until an
            administrator lifts the suspension.
          </p>
        ) : null}

        <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
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
