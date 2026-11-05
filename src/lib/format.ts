const compactMoney = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
})

export function formatMoney(amount: number) {
  return `৳${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}

export function formatCompactMoney(amount: number) {
  return `৳${compactMoney.format(amount)}`
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
