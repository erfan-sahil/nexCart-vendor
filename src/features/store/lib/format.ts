const countFormat = new Intl.NumberFormat("en-US")

const moneyFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

const dateFormat = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

export function formatCount(value: number) {
  return countFormat.format(value)
}

export function formatSales(value: number) {
  return moneyFormat.format(value)
}

export function formatJoined(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "—"
  }

  return dateFormat.format(date)
}

export function formatRating(average: number, count: number) {
  if (count < 1) {
    return "No ratings yet"
  }

  const label = count === 1 ? "rating" : "ratings"
  return `${average.toFixed(1)} from ${formatCount(count)} ${label}`
}
