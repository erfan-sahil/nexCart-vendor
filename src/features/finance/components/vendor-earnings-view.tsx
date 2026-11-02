"use client"

import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

import { getWalletBalances } from "../services/vendor-finance.api"

export function VendorEarningsView() {
  const query = useQuery({
    queryKey: ["vendor", "wallet", "balances"],
    queryFn: getWalletBalances,
  })

  if (query.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const balances = query.data

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Earnings</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Pending settlement</p>
          <p className="text-2xl font-semibold">
            ৳{balances?.pendingSettlement.toFixed(2) ?? "0.00"}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Available balance</p>
          <p className="text-2xl font-semibold">
            ৳{balances?.availableBalance.toFixed(2) ?? "0.00"}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Withdrawn</p>
          <p className="text-2xl font-semibold">
            ৳{balances?.withdrawnBalance.toFixed(2) ?? "0.00"}
          </p>
        </div>
      </div>
    </div>
  )
}
