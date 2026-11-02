import { useState, type ReactNode } from "react"
import { Loader2, Package } from "lucide-react"

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
import { cn } from "@/lib/utils"

import { VENDOR_ORDER_STATUS_LABEL } from "../constants"
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
import type {
  VendorInboundFulfillment,
  VendorOrderDetail,
  VendorOrderItem,
} from "../types"

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
      <DialogContent className="flex h-[min(44rem,calc(100dvh-2rem))] max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
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
      <DialogHeader className="shrink-0 border-b border-border px-5 py-4 pr-12 text-left">
        <DialogTitle className="text-lg leading-snug font-semibold">
          Order not found
        </DialogTitle>
        <DialogDescription>
          This vendor order could not be loaded.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="mx-0 mb-0 shrink-0 rounded-none border-border bg-card px-5 py-3">
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
  const actions = useVendorOrderActions()
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

  const primaryAction =
    order.status === "pending" ? (
      <Button
        type="button"
        className="cursor-pointer"
        disabled={busy}
        onClick={() => run(() => actions.accept.mutateAsync(order.id))}
      >
        Accept order
      </Button>
    ) : order.status === "accepted" ? (
      <Button
        type="button"
        className="cursor-pointer"
        disabled={busy}
        onClick={() => run(() => actions.prepare.mutateAsync(order.id))}
      >
        Start preparing
      </Button>
    ) : order.status === "preparing" ? (
      <Button
        type="button"
        className="cursor-pointer"
        disabled={busy}
        onClick={() => run(() => actions.ready.mutateAsync(order.id))}
      >
        Mark ready to ship
      </Button>
    ) : order.status === "ready_to_ship" ? (
      <Button
        type="button"
        className="cursor-pointer"
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
    ) : null

  return (
    <>
      <DialogHeader className="shrink-0 border-b border-border px-5 py-4 pr-12 text-left">
        <p className="text-xs font-medium text-brand-text">
          {order.storeName || "Store order"}
        </p>
        <DialogTitle className="mt-1 text-lg leading-snug font-semibold">
          {order.vendorOrderNumber}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Order details for {order.vendorOrderNumber}
        </DialogDescription>
        <div className="mt-3">
          <OrderStatusBadge status={order.status} />
        </div>
      </DialogHeader>

      <ScrollArea type="auto" className="min-h-0 flex-1">
        <div className="flex flex-col gap-6 px-5 py-5">
          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Fact
              label="Subtotal"
              value={formatMoney(order.itemsSubtotal)}
              detail={formatItemCount(order.items.length)}
            />
            <Fact
              label="Status"
              value={VENDOR_ORDER_STATUS_LABEL[order.status]}
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

          <Section
            title="Line items"
            meta={formatItemCount(order.items.length)}
          >
            <ItemList items={order.items} />
          </Section>

          {order.status === "ready_to_ship" ? (
            <Section title="Dispatch">
              <div className="rounded-lg border border-border px-3 py-3">
                <p className="mb-3 text-sm text-muted-foreground">
                  Enter courier details to send this order to the NexCart
                  warehouse.
                </p>
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
              </div>
            </Section>
          ) : null}

          {order.inbound ? (
            <Section title="Inbound shipment">
              <InboundSummary inbound={order.inbound} />
            </Section>
          ) : null}

          <Section title="Record">
            <FactList
              items={[
                { label: "Vendor order", value: order.vendorOrderNumber },
                { label: "Parent order", value: order.orderNumber },
                { label: "Store", value: order.storeName || "—" },
                {
                  label: "Status",
                  value: VENDOR_ORDER_STATUS_LABEL[order.status],
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
        </div>
      </ScrollArea>

      <DialogFooter className="mx-0 mb-0 shrink-0 rounded-none border-border bg-card px-5 py-3">
        {primaryAction}
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
      <div className="hidden grid-cols-[minmax(0,1.5fr)_5rem_6.5rem_6.5rem] gap-3 border-b border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground sm:grid">
        <span>Product</span>
        <span>Qty</span>
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
  return (
    <div className="grid gap-3 px-3 py-3 sm:grid-cols-[minmax(0,1.5fr)_5rem_6.5rem_6.5rem] sm:items-center">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Package className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{item.productName}</p>
          <p className="truncate text-xs text-muted-foreground">{item.sku}</p>
        </div>
      </div>
      <p className="text-sm">{item.quantity}</p>
      <p className="text-sm">{formatMoney(item.unitPrice)}</p>
      <p className="text-sm font-medium">{formatMoney(item.lineTotal)}</p>
    </div>
  )
}

function InboundSummary({ inbound }: { inbound: VendorInboundFulfillment }) {
  const carrier = inbound.inboundCarrier.trim() || "—"
  const tracking = inbound.inboundTracking.trim() || "—"

  return (
    <FactList
      items={[
        { label: "Fulfillment status", value: humanize(inbound.status) },
        { label: "Courier", value: carrier },
        { label: "Tracking", value: tracking },
        {
          label: "Dispatched",
          value: inbound.dispatchedAt
            ? formatOrderDateTime(inbound.dispatchedAt)
            : "—",
        },
        {
          label: "Received",
          value: inbound.receivedAt
            ? formatOrderDateTime(inbound.receivedAt)
            : "—",
        },
        {
          label: "Inspected",
          value: inbound.inspectedAt
            ? formatOrderDateTime(inbound.inspectedAt)
            : "—",
        },
      ]}
    />
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

function humanize(value: string) {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}
