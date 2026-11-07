import { useMemo, useState } from "react"

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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ApiError } from "@/lib/api/errors"
import { notifyError, notifySuccess } from "@/lib/notify"

import { vendorOrderStatusLabel } from "../lib/normalize-order-status"
import { useVendorOrderActions } from "../hooks/use-vendor-orders"
import {
  getStatusTransitions,
  type StatusTransitionOption,
  type VendorUpdatableStatus,
} from "../lib/status-transitions"
import type { VendorOrder } from "../types"

import { OrderStatusBadge } from "./order-status-badge"

type OrderStatusDialogProps = {
  order: VendorOrder | null
  onClose: () => void
}

export function OrderStatusDialog({ order, onClose }: OrderStatusDialogProps) {
  if (!order) {
    return null
  }

  return (
    <OrderStatusForm
      key={`${order.id}:${order.status}`}
      order={order}
      onClose={onClose}
    />
  )
}

function OrderStatusForm({
  order,
  onClose,
}: {
  order: VendorOrder
  onClose: () => void
}) {
  const { updateStatus } = useVendorOrderActions()
  const transitions = useMemo(
    () => getStatusTransitions(order.status),
    [order.status]
  )
  const [selectedStatus, setSelectedStatus] = useState<
    VendorUpdatableStatus | ""
  >(transitions[0]?.status ?? "")
  const [error, setError] = useState<string | null>(null)

  const selected: StatusTransitionOption | undefined = transitions.find(
    (option) => option.status === selectedStatus
  )

  const submit = async () => {
    if (!selected) {
      return
    }

    setError(null)

    try {
      await updateStatus.mutateAsync({
        vendorOrderId: order.id,
        status: selected.status,
      })
      notifySuccess("Order status updated")
      onClose()
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Could not update order status."

      setError(message)
      notifyError(err, message)
    }
  }

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent shell className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update order status</DialogTitle>
          <DialogDescription>
            Choose the next step for {order.vendorOrderNumber}.
          </DialogDescription>
        </DialogHeader>

        <DialogBody scroll={false} className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Current</span>
            <OrderStatusBadge status={order.status} />
          </div>

          {transitions.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
              No vendor actions are available for{" "}
              {vendorOrderStatusLabel(order.status).toLowerCase()} orders. Open
              order details to review warehouse progress.
            </p>
          ) : (
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="order-next-status">Next step</FieldLabel>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) =>
                    setSelectedStatus(value as VendorUpdatableStatus)
                  }
                >
                  <SelectTrigger id="order-next-status" className="w-full">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    {transitions.map((option) => (
                      <SelectItem key={option.status} value={option.status}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              {selected?.description ? (
                <p className="text-sm text-muted-foreground">
                  {selected.description}
                </p>
              ) : null}
            </FieldGroup>
          )}

          {error ? (
            <p
              role="alert"
              className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={
              selected?.status === "cancelled" ? "destructive" : "default"
            }
            className="cursor-pointer"
            disabled={
              !selected || updateStatus.isPending || transitions.length === 0
            }
            onClick={() => {
              void submit()
            }}
          >
            {updateStatus.isPending
              ? "Updating…"
              : (selected?.label ?? "Update")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
