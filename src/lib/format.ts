const compactMoney = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
})

export const CURRENCY_SUFFIX = "Tk"

type MoneyFractionDigits = {
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}

function formatAmount(
  amount: number,
  {
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
  }: MoneyFractionDigits = {}
) {
  const value = amount.toLocaleString(undefined, {
    minimumFractionDigits,
    maximumFractionDigits,
  })

  return `${value} ${CURRENCY_SUFFIX}`
}

export function formatMoney(amount: number) {
  return formatAmount(amount)
}

/** BDT wallet / payout amounts — always show two decimal places. */
export function formatBdt(amount: number) {
  return formatAmount(amount, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatCompactMoney(amount: number) {
  return `${compactMoney.format(amount)} ${CURRENCY_SUFFIX}`
}

export function formatSignedMoney(amount: number, credit: boolean) {
  const prefix = credit ? "+" : "−"
  return `${prefix}${formatMoney(amount)}`
}

export function formatSignedBdt(amount: number, credit: boolean) {
  const prefix = credit ? "+" : "−"
  return `${prefix}${formatBdt(amount)}`
}

export function formatPercent(value: number, fractionDigits = 1) {
  const rounded = Number(value.toFixed(fractionDigits))
  const prefix = rounded > 0 ? "+" : ""
  return `${prefix}${rounded}%`
}

export function formatBucketLabel(date: string, bucket: "day" | "month") {
  const parsed = bucket === "month" ? new Date(`${date}-01`) : new Date(date)

  if (Number.isNaN(parsed.getTime())) {
    return date
  }

  if (bucket === "month") {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      year: "2-digit",
    }).format(parsed)
  }

  return new Intl.DateTimeFormat("en", {
    weekday: "short",
  }).format(parsed)
}
