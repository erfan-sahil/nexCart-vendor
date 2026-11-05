"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

import { ApiError } from "@/lib/api/errors"

import {
  FinanceEmptyState,
  FinanceErrorState,
  FinancePagination,
  FinanceTableSkeleton,
} from "./finance-states"
import { WithdrawalCancelDialog } from "./withdrawal-cancel-dialog"
import { WithdrawalRequestCard } from "./withdrawal-request-card"
import { WithdrawalTable } from "./withdrawal-table"
import {
  cancelWithdrawal,
  createWithdrawal,
  getWalletBalances,
  listWithdrawals,
} from "../services/vendor-finance.api"
import type { WithdrawalRow } from "../services/vendor-finance.api"

const PAGE_SIZE = 20

export function VendorWithdrawalsView() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [amount, setAmount] = useState("")
  const [formError, setFormError] = useState<string | null>(null)
  const [cancelTarget, setCancelTarget] = useState<WithdrawalRow | null>(null)

  const balances = useQuery({
    queryKey: ["vendor", "wallet", "balances"],
    queryFn: getWalletBalances,
  })

  const list = useQuery({
    queryKey: ["vendor", "withdrawals", page],
    queryFn: () => listWithdrawals(page, PAGE_SIZE),
  })

  const create = useMutation({
    mutationFn: createWithdrawal,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["vendor"] })
      setAmount("")
      setFormError(null)
      setPage(1)
    },
  })

  const cancel = useMutation({
    mutationFn: cancelWithdrawal,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["vendor"] })
      setCancelTarget(null)
    },
  })

  const items = list.data?.items ?? []
  const pagination = list.data?.pagination
  const total = pagination?.total ?? items.length
  const totalPages = pagination?.totalPages ?? 1
  const available = balances.data?.availableBalance ?? 0

  const submitWithdrawal = async () => {
    setFormError(null)
    const parsed = Number(amount)

    if (!Number.isFinite(parsed) || parsed <= 0) {
      setFormError("Enter a valid amount greater than zero.")
      return
    }

    if (parsed > available) {
      setFormError("Amount exceeds your available balance.")
      return
    }

    try {
      await create.mutateAsync(parsed)
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Request failed.")
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Withdrawals</h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Request payouts from your available balance. Pending requests can be
          cancelled until admin review begins.
        </p>
      </header>

      {balances.isError ? (
        <FinanceErrorState
          title="Could not load balance"
          error={balances.error}
          onRetry={() => void balances.refetch()}
        />
      ) : balances.isPending && !balances.data ? (
        <div
          className="h-52 animate-pulse rounded-xl border border-border bg-muted/40"
          aria-hidden="true"
        />
      ) : (
        <WithdrawalRequestCard
          available={available}
          amount={amount}
          formError={formError}
          isBalanceLoading={balances.isLoading}
          isSubmitting={create.isPending}
          onAmountChange={setAmount}
          onSubmit={() => void submitWithdrawal()}
        />
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <div className="border-b border-border px-4 py-3 sm:px-5">
          <h2 className="text-sm font-semibold">Withdrawal history</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Recent payout requests and their status.
          </p>
        </div>

        {list.isPending && !list.data ? (
          <FinanceTableSkeleton />
        ) : list.isError ? (
          <FinanceErrorState
            title="Could not load withdrawals"
            error={list.error}
            onRetry={() => void list.refetch()}
          />
        ) : items.length === 0 ? (
          <FinanceEmptyState
            title="No withdrawals yet"
            description="When you request a payout from your available balance, it will appear here."
          />
        ) : (
          <>
            <WithdrawalTable
              rows={items}
              isRefreshing={list.isFetching && !list.isPending}
              cancelPendingId={
                cancel.isPending ? (cancelTarget?.id ?? null) : null
              }
              onCancel={setCancelTarget}
            />

            <div className="border-t border-border px-4 py-3 sm:px-5">
              <FinancePagination
                page={page}
                totalPages={totalPages}
                total={total}
                limit={PAGE_SIZE}
                itemNoun="withdrawals"
                disabled={list.isFetching}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>

      <section className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5">
        <h2 className="text-sm font-semibold">Payout timeline</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">Pending review</span>{" "}
            — your request is queued; you can cancel it from the history table.
          </li>
          <li>
            <span className="font-medium text-foreground">
              Approved & processing
            </span>{" "}
            — admin confirmed the payout; funds are reserved while transfer
            completes.
          </li>
          <li>
            <span className="font-medium text-foreground">Paid</span> — money
            sent to your saved payout account.
          </li>
          <li>
            Rejected or cancelled requests release reserved funds back to your
            available balance automatically.
          </li>
        </ul>
      </section>

      <WithdrawalCancelDialog
        withdrawal={cancelTarget}
        open={Boolean(cancelTarget)}
        isPending={cancel.isPending}
        onClose={() => {
          if (!cancel.isPending) {
            setCancelTarget(null)
          }
        }}
        onConfirm={(id) => cancel.mutate(id)}
      />
    </div>
  )
}
