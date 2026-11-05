"use client"

import { useQuery } from "@tanstack/react-query"
import { ArrowRight } from "lucide-react"
import { Link } from "react-router"

import { Button } from "@/components/ui/button"

import { FinanceErrorState, FinanceSummarySkeleton } from "./finance-states"
import { WalletSummaryCards } from "./wallet-summary-cards"
import { getWalletBalances } from "../services/vendor-finance.api"
import { formatBdt } from "../lib/format"

export function VendorEarningsView() {
  const query = useQuery({
    queryKey: ["vendor", "wallet", "balances"],
    queryFn: getWalletBalances,
  })

  const balances = query.data

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Earnings</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Track settlement holds, funds you can withdraw, and lifetime
            payouts.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/finance/transactions">
              View transactions
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/finance/withdrawals">Request withdrawal</Link>
          </Button>
        </div>
      </header>

      {query.isPending && !balances ? <FinanceSummarySkeleton /> : null}

      {query.isError ? (
        <FinanceErrorState
          title="Could not load earnings"
          error={query.error}
          onRetry={() => void query.refetch()}
        />
      ) : null}

      {balances ? (
        <>
          <WalletSummaryCards balances={balances} />

          <section className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5">
            <h2 className="text-sm font-semibold">How your balance works</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">
                  Pending settlement
                </span>{" "}
                ({formatBdt(balances.pendingSettlement)}) — earnings from recent
                orders before they move to your available balance.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Available balance
                </span>{" "}
                ({formatBdt(balances.availableBalance)}) — cleared funds you can
                withdraw anytime from the withdrawals page.
              </li>
              <li>
                <span className="font-medium text-foreground">Withdrawn</span> (
                {formatBdt(balances.withdrawnBalance)}) — approved by admin and
                moving through payout (includes completed transfers).
              </li>
            </ul>
          </section>
        </>
      ) : null}
    </div>
  )
}
