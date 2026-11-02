import { api } from "@/lib/api/client"
import { toApiError } from "@/lib/api/errors"
import type { ApiSuccess, PaginationMeta } from "@/lib/api/types"

export type WalletBalances = {
  storeId: string
  pendingSettlement: number
  availableBalance: number
  withdrawnBalance: number
}

export type LedgerRow = {
  id: string
  type: string
  amount: number
  account: string
  vendorOrderId: string | null
  createdAt: string
}

export type WithdrawalRow = {
  id: string
  amount: number
  status: string
  method: string
  payoutReference?: string
  createdAt: string
}

export async function getWalletBalances(): Promise<WalletBalances> {
  try {
    const { data } = await api.get<ApiSuccess<WalletBalances>>(
      "/vendor/wallet/balances"
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function listWalletTransactions(page = 1, limit = 20) {
  try {
    const { data } = await api.get<ApiSuccess<LedgerRow[]>>(
      "/vendor/wallet/transactions",
      {
        params: { page, limit },
      }
    )
    return {
      items: data.data,
      pagination: data.meta?.pagination as PaginationMeta,
    }
  } catch (error) {
    throw toApiError(error)
  }
}

export async function listWithdrawals(page = 1, limit = 20) {
  try {
    const { data } = await api.get<ApiSuccess<WithdrawalRow[]>>(
      "/vendor/withdrawals",
      {
        params: { page, limit },
      }
    )
    return {
      items: data.data,
      pagination: data.meta?.pagination as PaginationMeta,
    }
  } catch (error) {
    throw toApiError(error)
  }
}

export async function createWithdrawal(amount: number) {
  try {
    const { data } = await api.post<ApiSuccess<WithdrawalRow>>(
      "/vendor/withdrawals",
      {
        amount,
      }
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function cancelWithdrawal(withdrawalId: string) {
  try {
    const { data } = await api.post<ApiSuccess<{ id: string; status: string }>>(
      `/vendor/withdrawals/${withdrawalId}/cancel`
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}
