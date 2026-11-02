import type { VendorOrder, VendorOrderItem } from "../types"

function lineTargetQty(line: VendorOrderItem) {
  return line.targetQty ?? line.quantity ?? 0
}

function lineAcceptedQty(line: VendorOrderItem) {
  return line.acceptedQtyCumulative ?? 0
}

export function lineOutstandingQty(line: VendorOrderItem) {
  return Math.max(0, lineTargetQty(line) - lineAcceptedQty(line))
}

export function orderQtyProgress(order: Pick<VendorOrder, "items">) {
  const target = order.items.reduce((sum, line) => sum + lineTargetQty(line), 0)
  const accepted = order.items.reduce(
    (sum, line) => sum + lineAcceptedQty(line),
    0
  )
  const outstanding = Math.max(0, target - accepted)

  return { target, accepted, outstanding }
}

export function formatQtyProgress(order: Pick<VendorOrder, "items">) {
  const { accepted, target } = orderQtyProgress(order)

  if (target === 0) {
    return "—"
  }

  return `${accepted} / ${target} accepted`
}
