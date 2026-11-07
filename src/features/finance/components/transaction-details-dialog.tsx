import { ArrowDownLeft, ArrowUpRight } from "lucide-react"

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { LedgerTypeBadge } from "./ledger-type-badge"
import {
  isLedgerCredit,
  ledgerAccountLabel,
  ledgerTypeDescription,
  ledgerTypeLabel,
} from "../constants"
import {
  formatBdt,
  formatFinanceDateTime,
  formatSignedBdt,
} from "../lib/format"
import type { LedgerRow } from "../services/vendor-finance.api"

type TransactionDetailsDialogProps = {
  transaction: LedgerRow | null
  onClose: () => void
}

export function TransactionDetailsDialog({
  transaction,
  onClose,
}: TransactionDetailsDialogProps) {
  if (!transaction) {
    return null
  }

  const credit = isLedgerCredit(transaction.type, transaction.account)

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent shell className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-2">
              <DialogTitle>{ledgerTypeLabel(transaction.type)}</DialogTitle>
              <DialogDescription className="text-pretty">
                {ledgerTypeDescription(transaction.type, transaction.account)}
              </DialogDescription>
            </div>
            <LedgerTypeBadge
              type={transaction.type}
              account={transaction.account}
            />
          </div>
          <p
            className={cn(
              "mt-4 text-2xl font-semibold tracking-tight tabular-nums",
              credit
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-amber-900 dark:text-amber-100"
            )}
          >
            {formatSignedBdt(transaction.amount, credit)}
          </p>
          <p className="text-xs text-muted-foreground">
            {credit ? "Increases" : "Decreases"} your{" "}
            {ledgerAccountLabel(transaction.account).toLowerCase()}
          </p>
        </DialogHeader>

        <DialogBody className="py-4">
          <dl className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
            <Fact
              label="Date & time"
              value={formatFinanceDateTime(transaction.createdAt)}
            />
            <Fact
              label="Account"
              value={ledgerAccountLabel(transaction.account)}
            />
            <Fact label="Direction" value={credit ? "Credit" : "Debit"} />
            <Fact label="Amount" value={formatBdt(transaction.amount)} />
            <Fact
              label="Entry type"
              value={transaction.type.replace(/_/g, " ")}
              className="sm:col-span-2"
            />
            <Fact
              label="Transaction ID"
              value={transaction.id}
              mono
              className="sm:col-span-2"
            />
            <Fact
              label="Vendor order ID"
              value={transaction.vendorOrderId ?? "Not linked to an order"}
              mono={Boolean(transaction.vendorOrderId)}
              className="sm:col-span-2"
            />
          </dl>
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Fact({
  label,
  value,
  mono,
  className,
}: {
  label: string
  value: string
  mono?: boolean
  className?: string
}) {
  return (
    <div className={cn("bg-card px-3 py-2.5", className)}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "mt-0.5 text-sm wrap-break-word",
          mono && "font-mono text-xs leading-relaxed"
        )}
      >
        {value}
      </dd>
    </div>
  )
}

export function TransactionDirectionIcon({
  credit,
  className,
}: {
  credit: boolean
  className?: string
}) {
  const Icon = credit ? ArrowDownLeft : ArrowUpRight

  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-lg",
        credit
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "bg-amber-500/10 text-amber-900 dark:text-amber-100",
        className
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
    </span>
  )
}
