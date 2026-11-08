"use client"

import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

import {
  FinanceEmptyState,
  FinanceErrorState,
  FinancePagination,
  FinanceTableSkeleton,
} from "./finance-states"
import { TransactionDetailsDialog } from "./transaction-details-dialog"
import { TransactionTable } from "./transaction-table"
import { listWalletTransactions } from "../services/vendor-finance.api"
import type { LedgerRow } from "../services/vendor-finance.api"

const PAGE_SIZE = 20

export function VendorTransactionsView() {
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<LedgerRow | null>(null)

  const query = useQuery({
    queryKey: ["vendor", "wallet", "transactions", page],
    queryFn: () => listWalletTransactions(page, PAGE_SIZE),
  })

  const items = query.data?.items ?? []
  const pagination = query.data?.pagination
  const total = pagination?.total ?? items.length
  const totalPages = pagination?.totalPages ?? 1

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        {query.isPending && !query.data ? (
          <FinanceTableSkeleton />
        ) : query.isError ? (
          <FinanceErrorState
            title="Could not load transactions"
            error={query.error}
            onRetry={() => void query.refetch()}
          />
        ) : items.length === 0 ? (
          <FinanceEmptyState
            title="No transactions yet"
            description="When orders are fulfilled and earnings post to your wallet, they will appear here."
          />
        ) : (
          <>
            <TransactionTable
              rows={items}
              isRefreshing={query.isFetching && !query.isPending}
              onView={setSelected}
            />

            <div className="border-t border-border px-4 py-3">
              <FinancePagination
                page={page}
                totalPages={totalPages}
                total={total}
                limit={PAGE_SIZE}
                disabled={query.isFetching}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>

      <TransactionDetailsDialog
        transaction={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}
