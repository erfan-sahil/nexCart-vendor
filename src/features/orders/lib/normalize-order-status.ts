import { VENDOR_ORDER_STATUS_LABEL } from "../constants"
import type { VendorOrderStatus } from "../types"

/** Pre-architecture vendor order statuses still present in some records. */
const LEGACY_STATUS_MAP: Record<string, VendorOrderStatus> = {
  ready_to_ship: "preparing",
  in_transit: "sending_to_warehouse",
  received: "received_at_warehouse",
  partially_received: "partially_accepted",
  exception: "partially_accepted",
  completed: "delivered",
}

export function resolveVendorOrderStatus(
  status: string
): VendorOrderStatus | null {
  if (status in VENDOR_ORDER_STATUS_LABEL) {
    return status as VendorOrderStatus
  }

  return LEGACY_STATUS_MAP[status] ?? null
}

/** Maps legacy/unknown values to a known status for workflow rules. */
export function normalizeVendorOrderStatus(status: string): VendorOrderStatus {
  return resolveVendorOrderStatus(status) ?? "pending"
}

export function vendorOrderStatusLabel(status: string) {
  const resolved = resolveVendorOrderStatus(status)

  if (resolved) {
    return VENDOR_ORDER_STATUS_LABEL[resolved]
  }

  return status
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}
