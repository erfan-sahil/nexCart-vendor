import type { ProductOffer } from "../types"

const priceFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

const dateFormat = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

export function formatPriceRange(offer: ProductOffer) {
  const { minPrice, maxPrice } = offer

  if (minPrice === null || maxPrice === null) {
    return "No price"
  }

  if (minPrice === maxPrice) {
    return priceFormat.format(minPrice)
  }

  return `${priceFormat.format(minPrice)} – ${priceFormat.format(maxPrice)}`
}

export function formatProductDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "—"
  }

  return dateFormat.format(date)
}

export function formatVariantCount(count: number) {
  return count === 1 ? "1 variant" : `${count} variants`
}

export function formatResultRange(page: number, limit: number, total: number) {
  if (total === 0) {
    return "0 products"
  }

  const start = (page - 1) * limit + 1
  const end = Math.min(page * limit, total)
  return `${start}–${end} of ${total}`
}
