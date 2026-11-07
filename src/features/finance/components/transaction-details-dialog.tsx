import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarClock,
  Wallet,
  type LucideIcon,
} from "lucide-react"

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
  formatFinanceDate,
  formatFinanceTime,
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

        <DialogBody className="flex flex-col gap-5">
          <dl className="overflow-hidden rounded-xl border border-border">
            <SummaryRow
              icon={Wallet}
              label="Account"
              value={ledgerAccountLabel(transaction.account)}
              detail={accountDetail(transaction.account)}
            />
            <SummaryRow
              icon={credit ? ArrowDownLeft : ArrowUpRight}
              label="Direction"
              value={credit ? "Credit" : "Debit"}
              detail={credit ? "Adds to this account" : "Leaves this account"}
              tone={credit ? "credit" : "debit"}
            />
            <SummaryRow
              icon={CalendarClock}
              label="Posted"
              value={formatFinanceDate(transaction.createdAt)}
              detail={formatFinanceTime(transaction.createdAt)}
            />
          </dl>

          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Record
            </h3>
            <dl className="overflow-hidden rounded-xl border border-border">
              <Record
                label="Entry type"
                value={ledgerTypeLabel(transaction.type)}
                detail={transaction.type}
              />
              <Record label="Transaction ID" value={transaction.id} mono />
              <Record
                label="Vendor order"
                value={transaction.vendorOrderId ?? "Not linked to an order"}
                mono={Boolean(transaction.vendorOrderId)}
                muted={!transaction.vendorOrderId}
              />
            </dl>
          </section>
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

type AmountTone = "credit" | "debit"

const STAT_ICON = {
  neutral: "bg-brand-soft text-brand-text",
  credit: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  debit: "bg-amber-500/10 text-amber-900 dark:text-amber-100",
} as const

const AMOUNT_TEXT = {
  credit: "text-emerald-700 dark:text-emerald-300",
  debit: "text-amber-900 dark:text-amber-100",
} as const

function accountDetail(account: string) {
  switch (account) {
    case "pending":
      return "Waiting out the settlement hold"
    case "available":
      return "Cleared and ready to withdraw"
    case "reserved":
      return "Held until the payout finishes"
    default:
      return "Wallet account for this entry"
  }
}

function SummaryRow({
  icon: Icon,
  label,
  value,
  detail,
  tone = "neutral",
}: {
  icon: LucideIcon
  label: string
  value: string
  detail: string
  tone?: "neutral" | AmountTone
}) {
  return (
    <div className="flex items-start gap-3 border-b border-border px-3.5 py-3 last:border-b-0">
      <span
        className={cn(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
          STAT_ICON[tone]
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd
          className={cn(
            "mt-0.5 text-sm leading-snug font-semibold wrap-break-word",
            tone !== "neutral" && AMOUNT_TEXT[tone]
          )}
        >
          {value}
        </dd>
        <dd className="mt-0.5 text-xs leading-snug text-muted-foreground">
          {detail}
        </dd>
      </div>
    </div>
  )
}

function Record({
  label,
  value,
  detail,
  mono,
  muted,
}: {
  label: string
  value: string
  detail?: string
  mono?: boolean
  muted?: boolean
}) {
  return (
    <div className="grid gap-1 border-b border-border px-3.5 py-3 last:border-b-0 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:items-baseline sm:gap-4">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0 sm:text-right">
        <p
          className={cn(
            "text-sm font-medium wrap-break-word",
            mono && "font-mono text-xs leading-relaxed font-normal",
            muted && "font-sans text-sm font-normal text-muted-foreground"
          )}
        >
          {value}
        </p>
        {detail ? (
          <p className="mt-0.5 font-mono text-[0.7rem] text-muted-foreground sm:text-right">
            {detail}
          </p>
        ) : null}
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
