import { useState } from "react"
import { Ban, LoaderCircle, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ApiError } from "@/lib/api/errors"

import { withdrawalMethodLabel, withdrawalStatusLabel } from "../constants"
import { formatBdt, formatFinanceDateTime, shortenId } from "../lib/format"
import type { WithdrawalRow } from "../services/vendor-finance.api"
import { WithdrawalStatusBadge } from "./withdrawal-status-badge"

type WithdrawalCancelDialogProps = {
  withdrawal: WithdrawalRow | null
  isPending: boolean
  onClose: () => void
  onConfirm: (id: string) => Promise<void>
}

export function WithdrawalCancelDialog({
  withdrawal,
  isPending,
  onClose,
  onConfirm,
}: WithdrawalCancelDialogProps) {
  if (!withdrawal) {
    return null
  }

  return (
    <WithdrawalCancelConfirm
      key={withdrawal.id}
      withdrawal={withdrawal}
      isPending={isPending}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  )
}

function WithdrawalCancelConfirm({
  withdrawal,
  isPending,
  onClose,
  onConfirm,
}: {
  withdrawal: WithdrawalRow
  isPending: boolean
  onClose: () => void
  onConfirm: (id: string) => Promise<void>
}) {
  const [error, setError] = useState<string | null>(null)

  const confirm = async () => {
    setError(null)

    try {
      await onConfirm(withdrawal.id)
      onClose()
    } catch (caught) {
      const message =
        caught instanceof ApiError
          ? caught.message
          : "Could not cancel this withdrawal. Please try again."

      setError(message)
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next && !isPending) {
          onClose()
        }
      }}
    >
      <DialogContent shell className="sm:max-w-md" showCloseButton={!isPending}>
        <DialogHeader variant="destructive" className="py-5">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-destructive/15 text-destructive ring-4 ring-background">
              <Ban className="size-5" />
            </span>
            <div className="min-w-0">
              <DialogTitle>Cancel this withdrawal?</DialogTitle>
              <DialogDescription className="mt-1 text-foreground/70">
                This stops the payout request and returns the reserved amount to
                your available balance. You can request a new payout later.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogBody scroll={false} className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground ring-1 ring-border">
              <Wallet className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold tracking-tight tabular-nums">
                {formatBdt(withdrawal.amount)}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {withdrawalMethodLabel(withdrawal.method)}
                {" · "}
                {formatFinanceDateTime(withdrawal.createdAt)}
              </p>
            </div>
            <WithdrawalStatusBadge status={withdrawal.status} />
          </div>

          <p className="text-sm text-muted-foreground">
            Request{" "}
            <span className="font-mono text-xs text-foreground">
              {shortenId(withdrawal.id)}
            </span>{" "}
            is {withdrawalStatusLabel(withdrawal.status).toLowerCase()}.
            Cancelling releases {formatBdt(withdrawal.amount)} back to available
            balance.
          </p>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            disabled={isPending}
            onClick={onClose}
          >
            Keep request
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="cursor-pointer bg-[#dc2626] text-white hover:bg-[#b91c1c] dark:bg-[#dc2626] dark:text-white dark:hover:bg-[#ef4444]"
            disabled={isPending}
            onClick={() => {
              void confirm()
            }}
          >
            {isPending ? <LoaderCircle className="animate-spin" /> : <Ban />}
            {isPending ? "Cancelling…" : "Cancel withdrawal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
