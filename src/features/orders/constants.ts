import type { VendorOrderSort, VendorOrderStatus } from "./types"

export const VENDOR_ORDER_STATUSES = [
  "pending",
  "accepted",
  "preparing",
  "ready_to_ship",
  "in_transit",
  "received",
  "partially_received",
  "exception",
  "completed",
  "cancelled",
] as const satisfies readonly VendorOrderStatus[]

export const PROCESSING_STATUSES = [
  "accepted",
  "preparing",
  "ready_to_ship",
] as const satisfies readonly VendorOrderStatus[]

export const SHIPPED_STATUSES = [
  "in_transit",
  "received",
  "partially_received",
  "exception",
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
  preparing: "Preparing",
  ready_to_ship: "Ready to ship",
  in_transit: "In transit",
  received: "Received",
  partially_received: "Partially received",
  exception: "Exception",
  completed: "Completed",
  cancelled: "Cancelled",
}

export const VENDOR_ORDER_SORT_LABEL: Record<VendorOrderSort, string> = {
  "-createdAt": "Newest first",
  createdAt: "Oldest first",
  "-updatedAt": "Recently updated",
  updatedAt: "Least recently updated",
}

export type OrderStatusScope = "all" | "processing" | "shipped"

export function statusesForScope(
  scope: OrderStatusScope
): readonly VendorOrderStatus[] {
  if (scope === "processing") {
    return PROCESSING_STATUSES
  }

  if (scope === "shipped") {
    return SHIPPED_STATUSES
  }

  return VENDOR_ORDER_STATUSES
}
