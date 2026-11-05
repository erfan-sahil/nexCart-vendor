const dateFormat = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

const dateTimeFormat = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
})

export function formatBdt(amount: number) {
  return `৳${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatSignedBdt(amount: number, credit: boolean) {
  const prefix = credit ? "+" : "−"
  return `${prefix}${formatBdt(amount)}`
}

export function formatFinanceDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "—"
  }

  return dateFormat.format(date)
}

export function formatFinanceDateTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "—"
  }

  return dateTimeFormat.format(date)
}

export function formatListRange(
  page: number,
  limit: number,
  total: number,
  itemNoun: string
) {
  if (total === 0) {
    return `No ${itemNoun}`
  }

  const start = (page - 1) * limit + 1
  const end = Math.min(page * limit, total)
  return `${start}–${end} of ${total} ${itemNoun}`
}

export function formatTransactionRange(
  page: number,
  limit: number,
  total: number
) {
  return formatListRange(page, limit, total, "transactions")
}

export function formatWithdrawalRange(
  page: number,
  limit: number,
  total: number
) {
  return formatListRange(page, limit, total, "withdrawals")
}

export function shortenId(id: string, visible = 8) {
  if (id.length <= visible + 3) {
    return id
  }

  return `${id.slice(0, visible)}…`
}
