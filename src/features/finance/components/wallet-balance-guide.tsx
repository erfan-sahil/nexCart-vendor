import {
  ArrowDown,
  ArrowDownToLine,
  ArrowRight,
  Clock,
  Wallet,
  type LucideIcon,
} from "lucide-react"

import { dashboardPanelClass } from "@/features/dashboard/lib/dashboard-surface"
import { PanelSecondaryLink } from "@/features/dashboard/components/panel-secondary-link"
import { cn } from "@/lib/utils"

import type { WalletBalances } from "../services/vendor-finance.api"
import { formatBdt } from "../lib/format"

type GuideTone = "warning" | "success" | "info"

const TONE: Record<GuideTone, { icon: string; card: string; amount: string }> =
  {
    warning: {
      icon: "bg-amber-500/10 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200",
      card: "border-amber-500/15 bg-amber-500/[0.04] dark:border-amber-400/20 dark:bg-amber-500/[0.07]",
      amount: "text-amber-900 dark:text-amber-100",
    },
    success: {
      icon: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
      card: "border-emerald-500/15 bg-emerald-500/[0.04] dark:border-emerald-400/20 dark:bg-emerald-500/[0.07]",
      amount: "text-emerald-900 dark:text-emerald-100",
    },
    info: {
      icon: "bg-sky-500/10 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
      card: "border-sky-500/15 bg-sky-500/[0.04] dark:border-sky-400/20 dark:bg-sky-500/[0.07]",
      amount: "text-sky-900 dark:text-sky-100",
    },
  }

type WalletBalanceGuideProps = {
  balances: WalletBalances
}

type GuideStep = {
  key: string
  label: string
  amount: number
  description: string
  icon: LucideIcon
  tone: GuideTone
  action?: { to: string; label: string }
}

function FlowArrow({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center text-muted-foreground/70",
        className
      )}
      aria-hidden="true"
    >
      <ArrowRight className="hidden size-5 lg:block" />
      <ArrowDown className="size-5 lg:hidden" />
    </div>
  )
}

function GuideStepCard({ step }: { step: GuideStep }) {
  const styles = TONE[step.tone]
  const Icon = step.icon

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-xl border p-4 sm:p-5",
        styles.card
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-muted-foreground">
            {step.label}
          </p>
          <p
            className={cn(
              "mt-2 text-2xl font-semibold tracking-tight tabular-nums",
              styles.amount
            )}
          >
            {formatBdt(step.amount)}
          </p>
        </div>
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            styles.icon
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
        {step.description}
      </p>
      {step.action ? (
        <div className="mt-4">
          <PanelSecondaryLink to={step.action.to}>
            {step.action.label}
          </PanelSecondaryLink>
        </div>
      ) : null}
    </article>
  )
}

export function WalletBalanceGuide({ balances }: WalletBalanceGuideProps) {
  const steps: GuideStep[] = [
    {
      key: "pending",
      label: "Pending settlement",
      amount: balances.pendingSettlement,
      description:
        "Earnings from recent orders still in the settlement window. They move here first before clearing.",
      icon: Clock,
      tone: "warning",
    },
    {
      key: "available",
      label: "Available balance",
      amount: balances.availableBalance,
      description:
        "Cleared funds you can withdraw at any time. Request a payout when you are ready.",
      icon: Wallet,
      tone: "success",
      action: { to: "/finance/withdrawals", label: "Withdraw funds" },
    },
    {
      key: "withdrawn",
      label: "Withdrawn",
      amount: balances.withdrawnBalance,
      description:
        "Approved by admin and in payout processing, including transfers already completed.",
      icon: ArrowDownToLine,
      tone: "info",
      action: { to: "/finance/withdrawals", label: "View withdrawals" },
    },
  ]

  return (
    <section className={`p-4 sm:p-6 ${dashboardPanelClass}`}>
      <div className="max-w-2xl">
        <h2 className="text-sm font-semibold">How your balance works</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Earnings flow from new orders into settlement, then into funds you can
          withdraw, then out as payouts.
        </p>
      </div>

      <ol className="mt-6 flex list-none flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-2">
        {steps.map((step, index) => (
          <li key={step.key} className="contents">
            <div className="flex min-h-0 flex-1 flex-col lg:min-w-0">
              <span className="mb-2 hidden text-[11px] font-medium tracking-wider text-muted-foreground uppercase lg:block">
                Step {index + 1}
              </span>
              <GuideStepCard step={step} />
            </div>
            {index < steps.length - 1 ? (
              <FlowArrow className="py-1 lg:self-center lg:px-1 lg:py-0" />
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  )
}
