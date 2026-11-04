import { Building2, Smartphone, Wallet, type LucideIcon } from "lucide-react"

import { StatusBadge } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { useMyStore } from "@/features/store/hooks"
import type { StorePayout, VendorStore } from "@/features/store/types"
import { ApiError } from "@/lib/api/errors"

import { PayoutDetailsForm } from "./payout-details-form"

function PayoutDetailsSkeleton() {
  return (
    <div className="flex w-full flex-col gap-4" aria-hidden="true">
      <div className="h-28 animate-pulse rounded-xl bg-muted" />
      <div className="h-96 animate-pulse rounded-xl bg-muted" />
    </div>
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
      className="w-full rounded-xl border border-border bg-card px-4 py-16 text-center"
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

function formatUpdatedAt(value: string | undefined) {
  if (!value) {
    return "—"
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function maskAccountNumber(value: string | undefined) {
  const trimmed = value?.trim() ?? ""

  if (!trimmed) {
    return "—"
  }

  if (trimmed.length <= 4) {
    return trimmed
  }

  return `••••${trimmed.slice(-4)}`
}

function payoutMeta(payout: StorePayout | null): {
  icon: LucideIcon
  methodLabel: string
  destination: string
  holder: string
} {
  if (payout?.method === "bank") {
    return {
      icon: Building2,
      methodLabel: "Bank account",
      destination: payout.bankName.trim() || "—",
      holder: payout.accountHolderName.trim() || "—",
    }
  }

  if (payout?.method === "mobile") {
    return {
      icon: Smartphone,
      methodLabel: "Mobile wallet",
      destination: payout.provider.trim() || "—",
      holder: payout.accountHolderName.trim() || "—",
    }
  }

  return {
    icon: Wallet,
    methodLabel: "Not set",
    destination: "—",
    holder: "—",
  }
}

function PayoutOverview({ store }: { store: VendorStore }) {
  const payout = store.payout
  const meta = payoutMeta(payout)
  const Icon = meta.icon
  const configured = Boolean(payout)

  return (
    <section className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-text">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-base font-medium sm:text-lg">
                {configured ? meta.destination : "No payout account"}
              </h2>
              <StatusBadge
                icon={Icon}
                tone={configured ? "success" : "neutral"}
              >
                {configured ? "Configured" : "Not configured"}
              </StatusBadge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {configured
                ? `${meta.methodLabel} · ${meta.holder} · ${maskAccountNumber(payout?.accountNumber)}`
                : "Add a bank or mobile account for Finance withdrawals."}
            </p>
          </div>
        </div>

        <p className="shrink-0 text-xs text-muted-foreground sm:pt-1 sm:text-right">
          Updated {formatUpdatedAt(payout?.updatedAt)}
        </p>
      </div>
    </section>
  )
}

export function PayoutDetails() {
  const store = useMyStore()

  if (store.isPending) {
    return <PayoutDetailsSkeleton />
  }

  if (store.isError || !store.data) {
    return (
      <PayoutDetailsError
        error={store.error}
        onRetry={() => {
          void store.refetch()
        }}
      />
    )
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <PayoutOverview store={store.data} />
      <PayoutDetailsForm store={store.data} />
    </div>
  )
}
