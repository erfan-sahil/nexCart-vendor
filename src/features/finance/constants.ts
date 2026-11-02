export const LEDGER_ACCOUNT_LABEL: Record<string, string> = {
  pending: "Pending settlement",
  available: "Available balance",
  reserved: "Reserved",
}

export const LEDGER_TYPE_LABEL: Record<string, string> = {
  sale_credit: "Order sale",
  commission_debit: "Platform commission",
  settlement_release: "Settlement release",
  refund_debit: "Refund",
  adjustment_credit: "Adjustment (credit)",
  adjustment_debit: "Adjustment (debit)",
  withdrawal_debit: "Withdrawal",
  withdrawal_reversal: "Withdrawal reversal",
}

const CREDIT_TYPES = new Set([
  "sale_credit",
  "adjustment_credit",
  "withdrawal_reversal",
])

const DEBIT_TYPES = new Set([
  "commission_debit",
  "refund_debit",
  "adjustment_debit",
  "withdrawal_debit",
])

/** Whether the entry increases the vendor's balance for the given account. */
export function isLedgerCredit(type: string, account: string) {
  if (type === "settlement_release") {
    return account === "available"
  }

  if (CREDIT_TYPES.has(type)) {
    return true
  }

  if (DEBIT_TYPES.has(type)) {
    return false
  }

  return true
}

export function ledgerTypeLabel(type: string) {
  return LEDGER_TYPE_LABEL[type] ?? type.replace(/_/g, " ")
}

export function ledgerAccountLabel(account: string) {
  return LEDGER_ACCOUNT_LABEL[account] ?? account
}

export function ledgerTypeDescription(type: string, account: string) {
  switch (type) {
    case "sale_credit":
      return "Gross item subtotal credited to your pending balance when the order is recorded."
    case "commission_debit":
      return "Platform commission deducted from pending earnings for this order."
    case "settlement_release":
      return account === "available"
        ? "Cleared earnings moved into your available balance after the settlement hold."
        : "Amount released from pending settlement as part of the hold clearing process."
    case "refund_debit":
      return "Refund applied against your wallet for returned or adjusted order value."
    case "adjustment_credit":
      return "Manual or system credit adjusting your wallet balance."
    case "adjustment_debit":
      return "Manual or system debit adjusting your wallet balance."
    case "withdrawal_debit":
      return "Funds reserved or deducted when you request a withdrawal."
    case "withdrawal_reversal":
      return "Withdrawal amount returned to your wallet (for example after a cancelled payout)."
    default:
      return "Wallet ledger entry affecting your store balance."
  }
}
