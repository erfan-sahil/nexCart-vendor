import { ArrowDownLeft, ArrowUpRight } from "lucide-react"

import { CustomBadge } from "@/components/shared"

import { isLedgerCredit, ledgerTypeLabel } from "../constants"

type LedgerTypeBadgeProps = {
  type: string
  account: string
}

export function LedgerTypeBadge({ type, account }: LedgerTypeBadgeProps) {
  const credit = isLedgerCredit(type, account)

  return (
    <CustomBadge
      name={ledgerTypeLabel(type)}
      color={credit ? "success" : "warning"}
      icon={credit ? ArrowDownLeft : ArrowUpRight}
    />
  )
}
