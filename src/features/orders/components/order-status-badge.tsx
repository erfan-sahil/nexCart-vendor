import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  Clock,
  PackageCheck,
  PackageOpen,
  Truck,
  XCircle,
} from "lucide-react"

import {
  StatusBadge,
  type StatusBadgeTone,
} from "@/components/shared/status-badge"

import { VENDOR_ORDER_STATUS_LABEL } from "../constants"
import type { VendorOrderStatus } from "../types"

const STATUS_BADGE: Record<
  VendorOrderStatus,
  { icon: typeof Clock; tone: StatusBadgeTone }
> = {
  pending: { icon: Clock, tone: "warning" },
  accepted: { icon: CircleDashed, tone: "brand" },
  preparing: { icon: PackageOpen, tone: "brand" },
  ready_to_ship: { icon: PackageCheck, tone: "brand" },
  in_transit: { icon: Truck, tone: "brand" },
  received: { icon: CheckCircle2, tone: "success" },
  partially_received: { icon: AlertTriangle, tone: "warning" },
  exception: { icon: AlertTriangle, tone: "danger" },
  completed: { icon: CheckCircle2, tone: "success" },
  cancelled: { icon: XCircle, tone: "neutral" },
}

export function OrderStatusBadge({ status }: { status: VendorOrderStatus }) {
  const badge = STATUS_BADGE[status]
  const Icon = badge.icon

  return (
    <StatusBadge icon={Icon} tone={badge.tone}>
      {VENDOR_ORDER_STATUS_LABEL[status]}
    </StatusBadge>
  )
}
