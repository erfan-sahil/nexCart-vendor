import { VENDOR_ORDER_STATUS_LABEL } from "../constants"
import { normalizeVendorOrderStatus } from "./normalize-order-status"
import type { VendorOrderStatus } from "../types"

export type VendorUpdatableStatus =
  | "accepted"
  | "cancelled"
  | "preparing"
  | "sending_to_warehouse"
  | "received_returned_rejects"

export type StatusTransitionOption = {
  status: VendorUpdatableStatus
  label: string
  description?: string
}

type TransitionDefinition = {
  status: VendorUpdatableStatus
  label?: string
  description?: string
}

const TRANSITIONS: Partial<Record<VendorOrderStatus, TransitionDefinition[]>> =
  {
    pending: [
      { status: "accepted" },
      {
        status: "preparing",
        description: "Accepts this order and marks it as preparing.",
      },
      {
        status: "sending_to_warehouse",
        label: "Send to warehouse",
        description:
          "Accepts, prepares, and creates an inbound shipment batch.",
      },
      {
        status: "cancelled",
        label: "Cancel order",
        description: "Cancel before you start fulfillment.",
      },
    ],
    accepted: [
      { status: "preparing", label: "Start preparing" },
      {
        status: "sending_to_warehouse",
        label: "Send to warehouse",
        description:
          "Marks as preparing and creates an inbound shipment batch.",
      },
    ],
    preparing: [
      {
        status: "sending_to_warehouse",
        label: "Send to warehouse",
        description: "Creates a new inbound batch with outstanding quantities.",
      },
    ],
    partially_accepted: [
      {
        status: "preparing",
        label: "Prepare resend",
        description: "Only after rejected units are returned and acknowledged.",
      },
    ],
    rejected_at_warehouse: [
      {
        status: "preparing",
        label: "Prepare resend",
        description: "Only after rejected units are returned and acknowledged.",
      },
    ],
  }

export function getStatusTransitions(
  status: VendorOrderStatus | string
): StatusTransitionOption[] {
  const normalized = normalizeVendorOrderStatus(String(status))
  return (TRANSITIONS[normalized] ?? []).map((option) => ({
    ...option,
    label:
      option.label ??
      (option.status === "received_returned_rejects"
        ? "Confirm rejected products received"
        : VENDOR_ORDER_STATUS_LABEL[option.status]),
  }))
}

export function canUpdateOrderStatus(status: VendorOrderStatus | string) {
  return getStatusTransitions(status).length > 0
}

export function canAcknowledgeRejectReturns(
  rejectReturns: { status: string }[]
) {
  return rejectReturns.some((row) => row.status === "in_transit_to_vendor")
}

export function canConfirmVendorReturnShipments(
  shipments: { status: string }[]
) {
  return shipments.some((row) => row.status === "in_transit_to_vendor")
}
