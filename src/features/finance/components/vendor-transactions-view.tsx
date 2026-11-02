"use client"

import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { listWalletTransactions } from "../services/vendor-finance.api"

export function VendorTransactionsView() {
  const query = useQuery({
    queryKey: ["vendor", "wallet", "transactions"],
    queryFn: () => listWalletTransactions(1, 50),
  })

  if (query.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Transactions</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Account</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(query.data?.items ?? []).map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.type}</TableCell>
              <TableCell>{row.account}</TableCell>
              <TableCell>৳{row.amount.toFixed(2)}</TableCell>
              <TableCell>{new Date(row.createdAt).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
