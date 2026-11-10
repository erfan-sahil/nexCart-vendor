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
  type AppIcon,
} from "@/lib/icons"

import { CustomBadge, type BadgeColor } from "@/components/shared"

import {
  resolveVendorOrderStatus,
  vendorOrderStatusLabel,
} from "../lib/normalize-order-status"
import type { VendorOrderStatus } from "../types"

const STATUS_BADGE: Record<
  VendorOrderStatus,
  { icon: AppIcon; color: BadgeColor }
> = {
  pending: { icon: Clock, color: "warning" },
  accepted: { icon: CircleDashed, color: "brand" },
  cancelled: { icon: XCircle, color: "neutral" },
  preparing: { icon: PackageOpen, color: "brand" },
  sending_to_warehouse: { icon: Truck, color: "brand" },
  received_at_warehouse: { icon: Warehouse, color: "brand" },
  inspecting: { icon: Package, color: "warning" },
  accepted_at_warehouse: { icon: PackageCheck, color: "success" },
  partially_accepted: { icon: AlertTriangle, color: "warning" },
  rejected_at_warehouse: { icon: AlertTriangle, color: "danger" },
  packed: { icon: PackageCheck, color: "brand" },
  shipped: { icon: Truck, color: "brand" },
  out_for_delivery: { icon: Truck, color: "brand" },
  delivered: { icon: CheckCircle2, color: "success" },
  delivery_failed: { icon: AlertTriangle, color: "danger" },
  customer_rejected: { icon: AlertTriangle, color: "danger" },
  partially_rejected: { icon: AlertTriangle, color: "warning" },
}

const FALLBACK_BADGE = {
  icon: CircleDashed,
  color: "neutral" as const,
}

export function OrderStatusBadge({ status }: { status: string }) {
  const resolved = resolveVendorOrderStatus(status)
  const badge = resolved ? STATUS_BADGE[resolved] : FALLBACK_BADGE

  return (
    <CustomBadge
      name={vendorOrderStatusLabel(status)}
      color={badge.color}
      icon={badge.icon}
    />
  )
}
