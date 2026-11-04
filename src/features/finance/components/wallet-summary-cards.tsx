import {
  ArrowDownToLine,
  Clock,
  Landmark,
  Wallet,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

import type { WalletBalances } from "../services/vendor-finance.api"
import { formatBdt } from "../lib/format"

type Tone = "brand" | "warning" | "success" | "info"

const TONE: Record<Tone, string> = {
  brand: "bg-brand-soft text-brand-text",
  success:
    "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  warning:
    "bg-amber-500/10 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200",
  info: "bg-sky-500/10 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
}

type WalletSummaryCardsProps = {
  balances: WalletBalances
}

export function WalletSummaryCards({ balances }: WalletSummaryCardsProps) {
  const totalBalance = balances.pendingSettlement + balances.availableBalance

  const cards: {
    icon: LucideIcon
    tone: Tone
    label: string
    value: string
    detail: string
  }[] = [
    {
      icon: Landmark,
      tone: "brand",
      label: "Total balance",
      value: formatBdt(totalBalance),
      detail: "Pending settlement plus available to withdraw",
    },
    {
      icon: Clock,
      tone: "warning",
      label: "Pending settlement",
      value: formatBdt(balances.pendingSettlement),
      detail: "Held until orders clear the settlement window",
    },
    {
      icon: Wallet,
      tone: "success",
      label: "Available balance",
      value: formatBdt(balances.availableBalance),
      detail: "Ready to request as a withdrawal",
    },
    {
      icon: ArrowDownToLine,
      tone: "info",
      label: "Withdrawn",
      value: formatBdt(balances.withdrawnBalance),
      detail: "Approved by admin through paid out",
    },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <SummaryCard key={card.label} {...card} />
      ))}
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  tone,
  label,
  value,
  detail,
}: {
  icon: LucideIcon
  tone: Tone
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
      <span className="min-w-0">
        <span className="block text-xs font-medium text-muted-foreground">
          {label}
        </span>
        <span className="mt-2 block text-2xl font-semibold tracking-tight tabular-nums">
          {value}
        </span>
        <span className="mt-1 block text-xs text-muted-foreground">
          {detail}
        </span>
      </span>
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg",
          TONE[tone]
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
    </div>
  )
}
