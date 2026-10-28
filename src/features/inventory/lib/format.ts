const moneyFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

const countFormat = new Intl.NumberFormat("en-US")

const dateFormat = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

export function formatMoney(value: number) {
  return moneyFormat.format(value)
}

export function formatCount(value: number) {
  return countFormat.format(value)
}

export function formatUnits(value: number) {
  return value === 1 ? "1 unit" : `${formatCount(value)} units`
}

export function formatPriceRange(min: number | null, max: number | null) {
  if (min === null || max === null) {
    return "No price"
  }

  if (min === max) {
    return moneyFormat.format(min)
  }

  return `${moneyFormat.format(min)} – ${moneyFormat.format(max)}`
}

export function hasDiscount(price: number, currentPrice: number) {
  return Math.abs(price - currentPrice) >= 0.005
}

export function formatInventoryDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "—"
  }

  return dateFormat.format(date)
}

export function formatOptionLabel(options: { name: string; value: string }[]) {
  if (options.length === 0) {
    return "Default option"
  }

  return options.map((option) => `${option.name}: ${option.value}`).join(" · ")
}

export function formatResultRange(page: number, limit: number, total: number) {
  if (total === 0) {
    return "0 results"
  }

  const start = (page - 1) * limit + 1
  const end = Math.min(page * limit, total)
  return `${formatCount(start)}–${formatCount(end)} of ${formatCount(total)}`
}
