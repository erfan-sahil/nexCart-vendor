import { CircleCheck, CircleX, TriangleAlert } from "lucide-react"

import { CustomBadge, type BadgeColor } from "@/components/shared"

import { STOCK_LEVEL_LABEL } from "../constants"
import type { StockLevel } from "../types"

const STOCK_BADGE: Record<
  StockLevel,
  { icon: typeof CircleCheck; color: BadgeColor }
> = {
  in_stock: { icon: CircleCheck, color: "success" },
  low_stock: { icon: TriangleAlert, color: "warning" },
  out_of_stock: { icon: CircleX, color: "danger" },
}

export function StockLevelBadge({ level }: { level: StockLevel }) {
  const badge = STOCK_BADGE[level]

  return (
    <CustomBadge
      name={STOCK_LEVEL_LABEL[level]}
      color={badge.color}
      icon={badge.icon}
    />
  )
}
