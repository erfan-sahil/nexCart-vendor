"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ApiError } from "@/lib/api/errors"

import {
  cancelWithdrawal,
  createWithdrawal,
  getWalletBalances,
  listWithdrawals,
} from "../services/vendor-finance.api"

export function VendorWithdrawalsView() {
  const queryClient = useQueryClient()
  const balances = useQuery({
    queryKey: ["vendor", "wallet", "balances"],
    queryFn: getWalletBalances,
  })
  const list = useQuery({
    queryKey: ["vendor", "withdrawals"],
    queryFn: () => listWithdrawals(1, 50),
  })
  const [amount, setAmount] = useState("")
  const [error, setError] = useState<string | null>(null)

  const create = useMutation({
    mutationFn: createWithdrawal,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["vendor"] })
      setAmount("")
    },
  })

  const cancel = useMutation({
    mutationFn: cancelWithdrawal,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["vendor"] })
    },
  })

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Withdrawals</h1>
      <p className="text-sm text-muted-foreground">
        Available: ৳{balances.data?.availableBalance.toFixed(2) ?? "0.00"}
      </p>

      <form
        className="flex max-w-sm flex-col gap-3"
        onSubmit={async (event) => {
          event.preventDefault()
          setError(null)
          try {
            await create.mutateAsync(Number(amount))
          } catch (err) {
            setError(err instanceof ApiError ? err.message : "Request failed.")
          }
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (BDT)</Label>
          <Input
            id="amount"
            type="number"
            min={0}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" disabled={create.isPending}>
          Request withdrawal
        </Button>
      </form>

      {list.isLoading ? (
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {(list.data?.items ?? []).map((row) => (
              <TableRow key={row.id}>
                <TableCell>৳{row.amount.toFixed(2)}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>
                  {new Date(row.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  {row.status === "pending" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={cancel.isPending}
                      onClick={() => cancel.mutate(row.id)}
                    >
                      Cancel
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
