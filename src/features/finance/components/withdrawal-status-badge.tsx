import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import { withdrawalStatusLabel } from "../constants"

const STATUS_CLASS: Record<string, string> = {
  pending:
    "bg-amber-500/10 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200",
  approved: "bg-sky-500/10 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  processing:
    "bg-violet-500/10 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  paid: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  rejected: "bg-destructive/10 text-destructive dark:bg-destructive/20",
  cancelled: "bg-muted text-muted-foreground",
}

type WithdrawalStatusBadgeProps = {
  status: string
  className?: string
}

export function WithdrawalStatusBadge({
  status,
  className,
}: WithdrawalStatusBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "font-normal",
        STATUS_CLASS[status] ?? STATUS_CLASS.cancelled,
        className
      )}
    >
      {withdrawalStatusLabel(status)}
    </Badge>
  )
}
