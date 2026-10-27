import {
  Archive,
  BadgeCheck,
  CircleCheck,
  CircleX,
  Clock,
  Eye,
  EyeOff,
  Send,
  Star,
  Tag,
} from "lucide-react"

import {
  StatusBadge,
  type StatusBadgeTone,
} from "@/components/shared/status-badge"

import { PRODUCT_APPROVAL_LABEL, PRODUCT_STATUS_LABEL } from "../constants"
import type { Product, ProductApprovalStatus, ProductStatus } from "../types"

const STATUS_BADGE: Record<
  ProductStatus,
  { icon: typeof CircleCheck; tone: StatusBadgeTone }
> = {
  active: { icon: CircleCheck, tone: "success" },
  archived: { icon: Archive, tone: "neutral" },
}

const APPROVAL_BADGE: Record<
  ProductApprovalStatus,
  { icon: typeof Clock; tone: StatusBadgeTone }
> = {
  pending: { icon: Clock, tone: "warning" },
  submitted: { icon: Send, tone: "warning" },
  approved: { icon: BadgeCheck, tone: "success" },
  rejected: { icon: CircleX, tone: "danger" },
}

export function ProductStatusBadges({ product }: { product: Product }) {
  const status = STATUS_BADGE[product.status]
  const approval = APPROVAL_BADGE[product.approvalStatus]
  const StatusIcon = status.icon
  const ApprovalIcon = approval.icon

  return (
    <div className="flex flex-wrap gap-1.5">
      <StatusBadge icon={StatusIcon} tone={status.tone}>
        {PRODUCT_STATUS_LABEL[product.status]}
      </StatusBadge>
      <StatusBadge
        icon={ApprovalIcon}
        tone={approval.tone}
        title={product.reviewNote || undefined}
      >
        {PRODUCT_APPROVAL_LABEL[product.approvalStatus]}
      </StatusBadge>
      <StatusBadge
        icon={product.isPublished ? Eye : EyeOff}
        tone={product.isPublished ? "brand" : "neutral"}
      >
        {product.isPublished ? "Published" : "Unpublished"}
      </StatusBadge>
      {product.isFeatured ? (
        <StatusBadge icon={Star} tone="brand">
          Featured
        </StatusBadge>
      ) : null}
    </div>
  )
}

export function ProductTagBadge({ tag }: { tag: string }) {
  return (
    <StatusBadge icon={Tag} tone="neutral">
      {tag}
    </StatusBadge>
  )
}
