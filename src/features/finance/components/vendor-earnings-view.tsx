"use client"

import { useQuery } from "@tanstack/react-query"

import { FinanceErrorState, FinanceSummarySkeleton } from "./finance-states"
import { WalletBalanceGuide } from "./wallet-balance-guide"
import { WalletSummaryCards } from "./wallet-summary-cards"
import { getWalletBalances } from "../services/vendor-finance.api"

export function VendorEarningsView() {
  const query = useQuery({
    queryKey: ["vendor", "wallet", "balances"],
    queryFn: getWalletBalances,
  })

  const balances = query.data

  return (
    <div className="flex w-full flex-col gap-6">
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

          <WalletBalanceGuide balances={balances} />
        </>
      ) : null}
    </div>
  )
}
