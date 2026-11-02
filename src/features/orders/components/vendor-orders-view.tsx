"use client"

import { Loader2 } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ApiError } from "@/lib/api/errors"

import { formatMoney, VENDOR_ORDER_STATUS_LABEL } from "../labels"
import {
  useVendorOrder,
  useVendorOrderActions,
  useVendorOrders,
} from "../hooks/use-vendor-orders"
import type { VendorOrderStatus } from "../types/vendor-orders.types"

type VendorOrdersViewProps = {
  title: string
  description: string
  statusFilter?: VendorOrderStatus
  processingOnly?: boolean
}

const PROCESSING_STATUSES: VendorOrderStatus[] = [
  "accepted",
  "preparing",
  "ready_to_ship",
]

function OrderDetailDialog({
  orderId,
  open,
  onOpenChange,
}: {
  orderId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const detail = useVendorOrder(orderId ?? "")
  const actions = useVendorOrderActions()
  const order = detail.data
  const busy =
    actions.accept.isPending ||
    actions.prepare.isPending ||
    actions.ready.isPending
  const [error, setError] = useState<string | null>(null)

  const run = async (fn: () => Promise<unknown>) => {
    setError(null)
    try {
      await fn()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action failed.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {order?.vendorOrderNumber ?? "Vendor order"}
          </DialogTitle>
        </DialogHeader>
        {detail.isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : order ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Parent {order.orderNumber} ·{" "}
              {VENDOR_ORDER_STATUS_LABEL[order.status] ?? order.status}
            </p>
            <ul className="divide-y rounded-md border">
              {order.items.map((item) => (
                <li
                  key={item.sku}
                  className="flex justify-between gap-3 px-3 py-2 text-sm"
                >
                  <span>
                    {item.productName} × {item.quantity}
                  </span>
                  <span>{formatMoney(item.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm font-medium">
              Subtotal {formatMoney(order.itemsSubtotal)}
            </p>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <div className="flex flex-wrap gap-2">
              {order.status === "pending" ? (
                <Button
                  disabled={busy}
                  onClick={() =>
                    run(() => actions.accept.mutateAsync(order.id))
                  }
                >
                  Accept
                </Button>
              ) : null}
              {order.status === "accepted" ? (
                <Button
                  disabled={busy}
                  onClick={() =>
                    run(() => actions.prepare.mutateAsync(order.id))
                  }
                >
                  Start preparing
                </Button>
              ) : null}
              {order.status === "preparing" ? (
                <Button
                  disabled={busy}
                  onClick={() => run(() => actions.ready.mutateAsync(order.id))}
                >
                  Mark ready to ship
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

export function VendorOrdersView({
  title,
  description,
  statusFilter,
  processingOnly,
}: VendorOrdersViewProps) {
  const listQuery = useVendorOrders({
    limit: 50,
    sort: "-createdAt",
    status: statusFilter,
  })
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const items = useMemo(() => {
    const rows = listQuery.data?.items ?? []
    if (!processingOnly) return rows
    return rows.filter((row) => PROCESSING_STATUSES.includes(row.status))
  }, [listQuery.data?.items, processingOnly])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {title}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      {listQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subtotal</TableHead>
                <TableHead className="text-right">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No orders in this view yet.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedId(order.id)}
                  >
                    <TableCell className="font-medium">
                      {order.vendorOrderNumber}
                    </TableCell>
                    <TableCell>
                      {VENDOR_ORDER_STATUS_LABEL[order.status] ?? order.status}
                    </TableCell>
                    <TableCell>{formatMoney(order.itemsSubtotal)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {new Date(order.updatedAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <OrderDetailDialog
        orderId={selectedId}
        open={selectedId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null)
        }}
      />
    </div>
  )
}
