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
  type LucideIcon,
} from "lucide-react"

import { CustomBadge, type BadgeColor } from "@/components/shared"

import { PRODUCT_APPROVAL_LABEL, PRODUCT_STATUS_LABEL } from "../constants"
import type { Product, ProductApprovalStatus, ProductStatus } from "../types"

const STATUS_BADGE: Record<
  ProductStatus,
  { icon: LucideIcon; color: BadgeColor }
> = {
  active: { icon: CircleCheck, color: "success" },
  archived: { icon: Archive, color: "neutral" },
}

const APPROVAL_BADGE: Record<
  ProductApprovalStatus,
  { icon: LucideIcon; color: BadgeColor }
> = {
  pending: { icon: Clock, color: "warning" },
  submitted: { icon: Send, color: "warning" },
  approved: { icon: BadgeCheck, color: "success" },
  rejected: { icon: CircleX, color: "danger" },
}

export function ProductStatusBadges({ product }: { product: Product }) {
  const status = STATUS_BADGE[product.status]
  const approval = APPROVAL_BADGE[product.approvalStatus]

  return (
    <div className="flex flex-wrap gap-1.5">
      <CustomBadge
        name={PRODUCT_STATUS_LABEL[product.status]}
        color={status.color}
        icon={status.icon}
      />
      <CustomBadge
        name={PRODUCT_APPROVAL_LABEL[product.approvalStatus]}
        color={approval.color}
        icon={approval.icon}
        title={product.reviewNote || undefined}
      />
      <CustomBadge
        name={product.isPublished ? "Published" : "Unpublished"}
        color={product.isPublished ? "brand" : "neutral"}
        icon={product.isPublished ? Eye : EyeOff}
      />
      {product.isFeatured ? (
        <CustomBadge name="Featured" color="brand" icon={Star} />
      ) : null}
    </div>
  )
}

export function ProductTagBadge({ tag }: { tag: string }) {
  return <CustomBadge name={tag} color="neutral" icon={Tag} />
}
