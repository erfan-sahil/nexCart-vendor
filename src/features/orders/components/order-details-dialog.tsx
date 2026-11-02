import { useState } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ApiError } from "@/lib/api/errors"

import {
  useVendorOrder,
  useVendorOrderActions,
} from "../hooks/use-vendor-orders"
import { formatMoney, formatOrderDateTime } from "../lib/format"

import { OrderStatusBadge } from "./order-status-badge"

type OrderDetailsDialogProps = {
  orderId: string | null
  onClose: () => void
}

export function OrderDetailsDialog({
  orderId,
  onClose,
}: OrderDetailsDialogProps) {
  if (!orderId) {
    return null
  }

  return <OrderDetails key={orderId} orderId={orderId} onClose={onClose} />
}

function OrderDetails({
  orderId,
  onClose,
}: {
  orderId: string
  onClose: () => void
}) {
  const detail = useVendorOrder(orderId)
  const actions = useVendorOrderActions()
  const order = detail.data
  const [carrier, setCarrier] = useState("")
  const [tracking, setTracking] = useState("")
  const [error, setError] = useState<string | null>(null)

  const busy =
    actions.accept.isPending ||
    actions.prepare.isPending ||
    actions.ready.isPending ||
    actions.dispatchInbound.isPending

  const run = async (fn: () => Promise<unknown>) => {
    setError(null)
    try {
      await fn()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action failed.")
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent className="flex max-h-[90vh] max-w-lg flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle>
            {order?.vendorOrderNumber ?? "Vendor order"}
          </DialogTitle>
          <DialogDescription>
            {order
              ? `Parent ${order.orderNumber} · Updated ${formatOrderDateTime(order.updatedAt)}`
              : "Loading order details"}
          </DialogDescription>
        </DialogHeader>

        {detail.isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : order ? (
          <>
            <ScrollArea className="min-h-0 flex-1">
              <div className="space-y-4 px-6 py-4">
                <OrderStatusBadge status={order.status} />

                <ul className="divide-y divide-border rounded-lg border border-border">
                  {order.items.map((item) => (
                    <li
                      key={item.sku}
                      className="flex items-start justify-between gap-3 px-3 py-2.5 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {item.productName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.sku} · Qty {item.quantity}
                        </p>
                      </div>
                      <span className="shrink-0 tabular-nums">
                        {formatMoney(item.lineTotal)}
                      </span>
                    </li>
                  ))}
                </ul>

                <p className="text-sm font-medium">
                  Subtotal {formatMoney(order.itemsSubtotal)}
                </p>

                {error ? (
                  <p className="text-sm text-destructive" role="alert">
                    {error}
                  </p>
                ) : null}

                {order.status === "ready_to_ship" ? (
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="inbound-carrier">
                        Courier name
                      </FieldLabel>
                      <Input
                        id="inbound-carrier"
                        placeholder="e.g. Pathao, Steadfast"
                        value={carrier}
                        onChange={(event) => setCarrier(event.target.value)}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="inbound-tracking">
                        Tracking number
                      </FieldLabel>
                      <Input
                        id="inbound-tracking"
                        placeholder="Tracking or consignment ID"
                        value={tracking}
                        onChange={(event) => setTracking(event.target.value)}
                      />
                    </Field>
                  </FieldGroup>
                ) : null}
              </div>
            </ScrollArea>

            <DialogFooter className="border-t border-border px-6 py-4">
              {order.status === "pending" ? (
                <Button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    run(() => actions.accept.mutateAsync(order.id))
                  }
                >
                  Accept order
                </Button>
              ) : null}
              {order.status === "accepted" ? (
                <Button
                  type="button"
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
                  type="button"
                  disabled={busy}
                  onClick={() => run(() => actions.ready.mutateAsync(order.id))}
                >
                  Mark ready to ship
                </Button>
              ) : null}
              {order.status === "ready_to_ship" ? (
                <Button
                  type="button"
                  disabled={busy || !carrier.trim() || !tracking.trim()}
                  onClick={() =>
                    run(() =>
                      actions.dispatchInbound.mutateAsync({
                        vendorOrderId: order.id,
                        inboundCarrier: carrier.trim(),
                        inboundTracking: tracking.trim(),
                      })
                    )
                  }
                >
                  Dispatch to warehouse
                </Button>
              ) : null}
              <Button type="button" variant="outline" onClick={onClose}>
                Close
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-medium">Order not found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              This vendor order could not be loaded.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
