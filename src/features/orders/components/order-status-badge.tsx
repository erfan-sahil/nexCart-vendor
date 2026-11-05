import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  Clock,
  Package,
  PackageCheck,
  PackageOpen,
  Truck,
  Warehouse,
  XCircle,
} from "lucide-react"

import {
  StatusBadge,
  type StatusBadgeTone,
} from "@/components/shared/status-badge"

import {
  resolveVendorOrderStatus,
  vendorOrderStatusLabel,
} from "../lib/normalize-order-status"
import type { VendorOrderStatus } from "../types"

const STATUS_BADGE: Record<
  VendorOrderStatus,
  { icon: typeof Clock; tone: StatusBadgeTone }
> = {
  pending: { icon: Clock, tone: "warning" },
  accepted: { icon: CircleDashed, tone: "brand" },
  cancelled: { icon: XCircle, tone: "neutral" },
  preparing: { icon: PackageOpen, tone: "brand" },
  sending_to_warehouse: { icon: Truck, tone: "brand" },
  received_at_warehouse: { icon: Warehouse, tone: "brand" },
  inspecting: { icon: Package, tone: "warning" },
  accepted_at_warehouse: { icon: PackageCheck, tone: "success" },
  partially_accepted: { icon: AlertTriangle, tone: "warning" },
  rejected_at_warehouse: { icon: AlertTriangle, tone: "danger" },
  packed: { icon: PackageCheck, tone: "brand" },
  shipped: { icon: Truck, tone: "brand" },
  out_for_delivery: { icon: Truck, tone: "brand" },
  delivered: { icon: CheckCircle2, tone: "success" },
  delivery_failed: { icon: AlertTriangle, tone: "danger" },
  customer_rejected: { icon: AlertTriangle, tone: "danger" },
  partially_rejected: { icon: AlertTriangle, tone: "warning" },
}

const FALLBACK_BADGE = {
  icon: CircleDashed,
  tone: "neutral" as const,
}

export function OrderStatusBadge({ status }: { status: string }) {
  const resolved = resolveVendorOrderStatus(status)
  const badge = resolved ? STATUS_BADGE[resolved] : FALLBACK_BADGE
  const Icon = badge.icon

  return (
    <StatusBadge icon={Icon} tone={badge.tone}>
      {vendorOrderStatusLabel(status)}
    </StatusBadge>
  )
}
