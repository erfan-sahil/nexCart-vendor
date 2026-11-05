import type { VendorOrderSort, VendorOrderStatus } from "./types"

export const VENDOR_ORDER_STATUSES = [
  "pending",
  "accepted",
  "cancelled",
  "preparing",
  "sending_to_warehouse",
  "received_at_warehouse",
  "inspecting",
  "accepted_at_warehouse",
  "partially_accepted",
  "rejected_at_warehouse",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "delivery_failed",
  "customer_rejected",
  "partially_rejected",
] as const satisfies readonly VendorOrderStatus[]

/** Vendor action required (excluding awaiting accept). */
export const ACTION_STATUSES = [
  "accepted",
  "preparing",
  "partially_accepted",
  "rejected_at_warehouse",
] as const satisfies readonly VendorOrderStatus[]

/** Vendor action required before warehouse receives goods. */
export const PROCESSING_STATUSES = [
  "pending",
  ...ACTION_STATUSES,
] as const satisfies readonly VendorOrderStatus[]

/** Sent to warehouse through delivery to customer. */
export const SHIPPED_STATUSES = [
  "sending_to_warehouse",
  "received_at_warehouse",
  "inspecting",
  "accepted_at_warehouse",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
] as const satisfies readonly VendorOrderStatus[]

/** Warehouse rejects and delivery-failure returns visible to vendors. */
export const RETURNS_STATUSES = [
  "partially_accepted",
  "rejected_at_warehouse",
  "delivery_failed",
  "customer_rejected",
  "partially_rejected",
] as const satisfies readonly VendorOrderStatus[]

export const VENDOR_ORDER_SORTS = [
  "-createdAt",
  "createdAt",
  "-updatedAt",
  "updatedAt",
] as const satisfies readonly VendorOrderSort[]

export const DEFAULT_ORDER_SORT: VendorOrderSort = "-createdAt"
export const DEFAULT_ORDER_PAGE_SIZE = 20

export const VENDOR_ORDER_STATUS_LABEL: Record<VendorOrderStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  cancelled: "Cancelled",
  preparing: "Preparing",
  sending_to_warehouse: "Sending to warehouse",
  received_at_warehouse: "Received at warehouse",
  inspecting: "Inspecting",
  accepted_at_warehouse: "Accepted at warehouse",
  partially_accepted: "Partially accepted",
  rejected_at_warehouse: "Rejected at warehouse",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  delivery_failed: "Delivery failed",
  customer_rejected: "Customer rejected",
  partially_rejected: "Partially rejected",
}

export const VENDOR_RETURN_SHIPMENT_STATUS_LABEL: Record<
  import("./types").VendorReturnShipmentStatus,
  string
> = {
  pending_dispatch_to_vendor: "Pending dispatch to you",
  in_transit_to_vendor: "In transit to you",
  received_by_vendor: "Received by you",
}

export const INBOUND_BATCH_STATUS_LABEL: Record<
  import("./types").InboundBatchStatus,
  string
> = {
  dispatched: "Dispatched",
  received: "Received",
  inspecting: "Inspecting",
  inspected: "Inspected",
}

export const REJECT_RETURN_STATUS_LABEL: Record<
  import("./types").RejectReturnStatus,
  string
> = {
  pending_return: "Pending return",
  in_transit_to_vendor: "In transit to you",
  received_by_vendor: "Received by you",
}

export const VENDOR_ORDER_SORT_LABEL: Record<VendorOrderSort, string> = {
  "-createdAt": "Newest first",
  createdAt: "Oldest first",
  "-updatedAt": "Recently updated",
  updatedAt: "Least recently updated",
}

export type OrderStatusTab =
  | "all"
  | "pending"
  | "action"
  | "inbound"
  | "warehouse"
  | "delivery"
  | "cancelled"

export const ORDER_STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "action", label: "Action" },
  { value: "inbound", label: "Sent to warehouse" },
  { value: "warehouse", label: "At warehouse" },
  { value: "delivery", label: "Delivery" },
  { value: "cancelled", label: "Cancelled" },
] as const satisfies ReadonlyArray<{
  value: OrderStatusTab
  label: string
}>

export const DEFAULT_ORDER_TAB: OrderStatusTab = "all"

/** @deprecated Use OrderStatusTab on the orders page. */
export type OrderStatusScope = "all" | "processing" | "shipped" | "returns"

export function statusesForTab(
  tab: OrderStatusTab
): readonly VendorOrderStatus[] | null {
  switch (tab) {
    case "all":
      return null
    case "pending":
      return ["pending"]
    case "action":
      return ACTION_STATUSES
    case "inbound":
      return ["sending_to_warehouse"]
    case "warehouse":
      return [
        "received_at_warehouse",
        "inspecting",
        "accepted_at_warehouse",
        "packed",
        "shipped",
      ]
    case "delivery":
      return ["out_for_delivery", "delivered"]
    case "cancelled":
      return ["cancelled"]
    default:
      return null
  }
}

export function apiStatusForTab(
  tab: OrderStatusTab
): VendorOrderStatus | undefined {
  const statuses = statusesForTab(tab)
  return statuses?.length === 1 ? statuses[0] : undefined
}

export function statusesForScope(
  scope: OrderStatusScope
): readonly VendorOrderStatus[] {
  if (scope === "processing") {
    return PROCESSING_STATUSES
  }

  if (scope === "shipped") {
    return SHIPPED_STATUSES
  }

  if (scope === "returns") {
    return RETURNS_STATUSES
  }

  return VENDOR_ORDER_STATUSES
}
