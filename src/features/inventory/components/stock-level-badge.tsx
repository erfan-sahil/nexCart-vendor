import { CircleCheck, CircleX, TriangleAlert } from "lucide-react"

import {
  StatusBadge,
  type StatusBadgeTone,
} from "@/components/shared/status-badge"

import { STOCK_LEVEL_LABEL } from "../constants"
import type { StockLevel } from "../types"

const STOCK_BADGE: Record<
  StockLevel,
  { icon: typeof CircleCheck; tone: StatusBadgeTone }
> = {
  in_stock: { icon: CircleCheck, tone: "success" },
  low_stock: { icon: TriangleAlert, tone: "warning" },
  out_of_stock: { icon: CircleX, tone: "danger" },
}

export function StockLevelBadge({ level }: { level: StockLevel }) {
  const badge = STOCK_BADGE[level]

  return (
    <StatusBadge icon={badge.icon} tone={badge.tone}>
      {STOCK_LEVEL_LABEL[level]}
    </StatusBadge>
  )
}
