import {
  BadgeCheck,
  Ban,
  CircleCheck,
  CircleX,
  Clock,
  Loader,
  type LucideIcon,
} from "lucide-react"

import { CustomBadge, type BadgeColor } from "@/components/shared"

import { withdrawalStatusLabel } from "../constants"

const STATUS_BADGE: Record<string, { color: BadgeColor; icon: LucideIcon }> = {
  pending: { color: "warning", icon: Clock },
  approved: { color: "info", icon: BadgeCheck },
  processing: { color: "violet", icon: Loader },
  paid: { color: "success", icon: CircleCheck },
  rejected: { color: "danger", icon: CircleX },
  cancelled: { color: "neutral", icon: Ban },
}

type WithdrawalStatusBadgeProps = {
  status: string
  className?: string
}

export function WithdrawalStatusBadge({
  status,
  className,
}: WithdrawalStatusBadgeProps) {
  const badge = STATUS_BADGE[status] ?? STATUS_BADGE.cancelled

  return (
    <CustomBadge
      name={withdrawalStatusLabel(status)}
      color={badge.color}
      icon={badge.icon}
      className={className}
    />
  )
}
