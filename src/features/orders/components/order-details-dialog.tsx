import { useState, type ReactNode } from "react"
import { Loader2, Package } from "@/lib/icons"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ApiError } from "@/lib/api/errors"
import { notifyError, notifySuccess } from "@/lib/notify"
import { cn } from "@/lib/utils"

import { vendorOrderStatusLabel } from "../lib/normalize-order-status"
import {
  useVendorOrder,
  useVendorOrderActions,
} from "../hooks/use-vendor-orders"
import {
  formatItemCount,
  formatMoney,
  formatOrderDate,
  formatOrderDateTime,
} from "../lib/format"
import {
  formatQtyProgress,
  lineOutstandingQty,
  orderQtyProgress,
} from "../lib/order-progress"
import {
  canAcknowledgeRejectReturns,
  canConfirmVendorReturnShipments,
  getStatusTransitions,
} from "../lib/status-transitions"
import type { VendorOrderDetail, VendorOrderItem } from "../types"

import {
  OrderCustomerAcceptanceSummary,
  OrderDeliveryReturnNotice,
  OrderInboundBatches,
  OrderRejectReturns,
  OrderVendorReturnShipments,
} from "./order-fulfillment-sections"
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
  const order = detail.data

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        shell
        className="h-[min(44rem,calc(100dvh-2rem))] sm:max-w-3xl"
      >
        {detail.isPending ? (
          <OrderDetailsLoading />
        ) : detail.isError || !order ? (
          <OrderDetailsError onClose={onClose} />
        ) : (
          <OrderDetailsBody order={order} onClose={onClose} />
        )}
      </DialogContent>
    </Dialog>
  )
}

function OrderDetailsLoading() {
  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
      <span className="sr-only">Loading order details</span>
    </div>
  )
}

function OrderDetailsError({ onClose }: { onClose: () => void }) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Order not found</DialogTitle>
        <DialogDescription>
          This vendor order could not be loaded.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer"
          onClick={onClose}
        >
          Close
        </Button>
      </DialogFooter>
    </>
  )
}

function OrderDetailsBody({
  order,
  onClose,
}: {
  order: VendorOrderDetail
  onClose: () => void
}) {
  const { updateStatus, confirmVendorReturn } = useVendorOrderActions()
  const [error, setError] = useState<string | null>(null)
  const busy = updateStatus.isPending || confirmVendorReturn.isPending
  const progress = orderQtyProgress(order)
  const transitions = getStatusTransitions(order.status)
  const showAck = canAcknowledgeRejectReturns(order.rejectReturns)
  const vendorReturnShipments = order.vendorReturnShipments ?? []
  const rejectionSummary = order.rejectionSummary ?? []
  const pendingVendorReturns = vendorReturnShipments.filter(
    (shipment) => shipment.status === "in_transit_to_vendor"
  )
  const showVendorReturnAck = canConfirmVendorReturnShipments(
    vendorReturnShipments
  )

  const run = async (
    fn: () => Promise<unknown>,
    successMessage = "Order updated"
  ) => {
    setError(null)
    try {
      await fn()
      notifySuccess(successMessage)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Action failed."

      setError(message)
      notifyError(err, message)
    }
  }

  const primaryActions: ReactNode[] = []

  if (showVendorReturnAck) {
    for (const shipment of pendingVendorReturns) {
      primaryActions.push(
        <Button
          key={`vendor-return-${shipment.id}`}
          type="button"
          className="cursor-pointer"
          disabled={busy}
          onClick={() =>
            run(
              () => confirmVendorReturn.mutateAsync(shipment.id),
              "Return shipment confirmed"
            )
          }
        >
          Confirm returned products received
        </Button>
      )
    }
  }

  if (showAck) {
    primaryActions.push(
      <Button
        key="ack"
        type="button"
        variant="outline"
        className="cursor-pointer"
        disabled={busy}
        onClick={() =>
          run(() =>
            updateStatus.mutateAsync({
              vendorOrderId: order.id,
              status: "received_returned_rejects",
            })
          )
        }
      >
        Confirm warehouse rejects received
      </Button>
    )
  }

  for (const step of transitions) {
    primaryActions.push(
      <Button
        key={step.status}
        type="button"
        variant={step.status === "cancelled" ? "destructive" : "default"}
        className="cursor-pointer"
        disabled={busy}
        onClick={() =>
          run(() =>
            updateStatus.mutateAsync({
              vendorOrderId: order.id,
              status: step.status,
            })
          )
        }
      >
        {step.label}
      </Button>
    )
  }

  return (
    <>
      <DialogHeader>
        <p className="text-xs font-medium text-brand-text">
          {order.storeName || "Store order"}
        </p>
        <DialogTitle className="mt-1">{order.vendorOrderNumber}</DialogTitle>
        <DialogDescription className="sr-only">
          Order details for {order.vendorOrderNumber}
        </DialogDescription>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <span className="text-xs text-muted-foreground">
            {formatQtyProgress(order)}
            {progress.outstanding > 0
              ? ` · ${progress.outstanding} still needed`
              : ""}
          </span>
        </div>
      </DialogHeader>

      <DialogBody className="flex flex-col gap-6">
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Fact
            label="Subtotal"
            value={formatMoney(order.itemsSubtotal)}
            detail={formatItemCount(order.items.length)}
          />
          <Fact
            label="Status"
            value={vendorOrderStatusLabel(order.status)}
            detail={`Parent ${order.orderNumber}`}
          />
          <Fact
            label="Created"
            value={formatOrderDate(order.createdAt)}
            detail={formatOrderDateTime(order.createdAt)}
          />
          <Fact
            label="Updated"
            value={formatOrderDate(order.updatedAt)}
            detail={formatOrderDateTime(order.updatedAt)}
          />
        </dl>

        {error ? (
          <p
            role="alert"
            className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        ) : null}

        <Section title="Line items" meta={formatItemCount(order.items.length)}>
          <ItemList items={order.items} />
        </Section>

        {rejectionSummary.some((row) => row.rejectedQty > 0) ? (
          <Section title="Customer acceptance">
            <OrderCustomerAcceptanceSummary summary={rejectionSummary} />
          </Section>
        ) : null}

        <Section
          title="Inbound batches"
          meta={`${order.inboundBatches.length} shipment${
            order.inboundBatches.length === 1 ? "" : "s"
          }`}
        >
          <OrderInboundBatches batches={order.inboundBatches} />
        </Section>

        {order.rejectReturns.length > 0 ? (
          <Section title="Warehouse reject returns">
            <OrderRejectReturns returns={order.rejectReturns} />
          </Section>
        ) : null}

        {vendorReturnShipments.length > 0 ? (
          <Section title="Returned products to you">
            <OrderVendorReturnShipments shipments={vendorReturnShipments} />
          </Section>
        ) : null}

        {order.status === "delivery_failed" ||
        order.status === "customer_rejected" ||
        order.status === "partially_rejected" ? (
          <Section title="Delivery return">
            <OrderDeliveryReturnNotice status={order.status} />
          </Section>
        ) : null}

        <Section title="Record">
          <FactList
            items={[
              { label: "Vendor order", value: order.vendorOrderNumber },
              { label: "Parent order", value: order.orderNumber },
              { label: "Store", value: order.storeName || "—" },
              {
                label: "Warehouse progress",
                value: formatQtyProgress(order),
              },
              {
                label: "Created",
                value: formatOrderDateTime(order.createdAt),
              },
              {
                label: "Updated",
                value: formatOrderDateTime(order.updatedAt),
              },
            ]}
          />
        </Section>
      </DialogBody>

      <DialogFooter className="flex-wrap">
        {primaryActions}
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer"
          onClick={onClose}
        >
          Close
        </Button>
      </DialogFooter>
    </>
  )
}

function ItemList({ items }: { items: VendorOrderItem[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
        This order has no line items.
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="hidden grid-cols-[minmax(0,1.4fr)_4rem_4rem_4rem_5rem_5rem] gap-2 border-b border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground sm:grid">
        <span>Product</span>
        <span>Target</span>
        <span>Accepted</span>
        <span>Left</span>
        <span>Unit</span>
        <span>Line total</span>
      </div>
      <ul>
        {items.map((item) => (
          <li
            key={`${item.variantId}-${item.sku}`}
            className="border-b border-border last:border-b-0"
          >
            <ItemRow item={item} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function ItemRow({ item }: { item: VendorOrderItem }) {
  const outstanding = lineOutstandingQty(item)

  return (
    <div className="grid gap-2 px-3 py-3 sm:grid-cols-[minmax(0,1.4fr)_4rem_4rem_4rem_5rem_5rem] sm:items-center">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Package className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{item.productName}</p>
          <p className="truncate text-xs text-muted-foreground">
            {item.sku}
            {item.expectedQty !== item.targetQty
              ? ` · ordered ${item.expectedQty}`
              : ""}
          </p>
        </div>
      </div>
      <p className="text-sm">{item.targetQty}</p>
      <p className="text-sm">{item.acceptedQtyCumulative}</p>
      <p className="text-sm text-muted-foreground">{outstanding}</p>
      <p className="text-sm">{formatMoney(item.unitPrice)}</p>
      <p className="text-sm font-medium">{formatMoney(item.lineTotal)}</p>
    </div>
  )
}

function Section({
  title,
  meta,
  className,
  children,
}: {
  title: string
  meta?: string
  className?: string
  children: ReactNode
}) {
  return (
    <section className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {title}
        </h3>
        {meta ? <p className="text-xs text-muted-foreground">{meta}</p> : null}
      </div>
      {children}
    </section>
  )
}

function Fact({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail?: string
}) {
  return (
    <div className="min-w-0 rounded-lg border border-border px-3 py-2.5">
      <dt className="text-[0.65rem] tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-1 truncate text-sm font-medium">{value}</dd>
      {detail ? (
        <dd className="truncate text-xs text-muted-foreground">{detail}</dd>
      ) : null}
    </div>
  )
}

function FactList({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="bg-card px-3 py-2.5">
          <dt className="text-xs text-muted-foreground">{item.label}</dt>
          <dd className="mt-0.5 text-sm wrap-break-word">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
