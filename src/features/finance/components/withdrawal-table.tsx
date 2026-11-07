import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { withdrawalMethodLabel } from "../constants"
import { formatBdt, formatFinanceDateTime, shortenId } from "../lib/format"
import type { WithdrawalRow } from "../services/vendor-finance.api"
import { WithdrawalStatusBadge } from "./withdrawal-status-badge"

type WithdrawalTableProps = {
  rows: WithdrawalRow[]
  isRefreshing: boolean
  cancelPendingId: string | null
  onCancel: (row: WithdrawalRow) => void
}

export function WithdrawalTable({
  rows,
  isRefreshing,
  cancelPendingId,
  onCancel,
}: WithdrawalTableProps) {
  return (
    <div
      className={cn(
        "transition-opacity",
        isRefreshing && "pointer-events-none opacity-70"
      )}
    >
      <Table>
        <TableCaption className="sr-only">Withdrawal requests</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Request</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Reference</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-28 text-end">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="min-w-44 py-3 pl-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {formatFinanceDateTime(row.createdAt)}
                  </p>
                  <p
                    className="truncate font-mono text-[0.65rem] text-muted-foreground/80"
                    title={row.id}
                  >
                    {shortenId(row.id, 10)}
                  </p>
                </div>
              </TableCell>
              <TableCell className="py-3 text-sm text-muted-foreground">
                {withdrawalMethodLabel(row.method)}
              </TableCell>
              <TableCell className="py-3">
                <WithdrawalStatusBadge status={row.status} />
              </TableCell>
              <TableCell className="hidden py-3 md:table-cell">
                {row.payoutReference ? (
                  <span
                    className="font-mono text-xs text-muted-foreground"
                    title={row.payoutReference}
                  >
                    {shortenId(row.payoutReference, 12)}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="py-3 pr-2 text-right font-medium tabular-nums">
                {formatBdt(row.amount)}
              </TableCell>
              <TableCell className="py-3 pr-4 text-end">
                {row.status === "pending" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={cancelPendingId === row.id}
                    onClick={() => onCancel(row)}
                  >
                    Cancel
                  </Button>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
