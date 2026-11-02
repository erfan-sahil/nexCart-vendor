import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import { isLedgerCredit, ledgerTypeLabel } from "../constants"

type LedgerTypeBadgeProps = {
  type: string
  account: string
}

export function LedgerTypeBadge({ type, account }: LedgerTypeBadgeProps) {
  const credit = isLedgerCredit(type, account)
  const label = ledgerTypeLabel(type)

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-normal",
        credit
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
          : "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-100"
      )}
    >
      {label}
    </Badge>
  )
}
