export const VENDOR_ORDER_STATUS_LABEL: Record<string, string> = {
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

export function formatMoney(amount: number, currency = "BDT") {
  return `${currency} ${amount.toLocaleString()}`
}
