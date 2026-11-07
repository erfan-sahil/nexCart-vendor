import { formatMoney as formatTkMoney } from "@/lib/format"

import type { ProductOffer } from "../types"

const dateFormat = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

export function formatMoney(value: number) {
  return formatTkMoney(value)
}

export function formatPriceRange(offer: ProductOffer) {
  const { minPrice, maxPrice } = offer

  if (minPrice === null || maxPrice === null) {
    return "No price"
  }

  if (minPrice === maxPrice) {
    return formatMoney(minPrice)
  }

  return `${formatMoney(minPrice)} – ${formatMoney(maxPrice)}`
}

export function formatOriginalPriceRange(offer: ProductOffer) {
  const { minOriginalPrice, maxOriginalPrice } = offer

  if (minOriginalPrice === null || maxOriginalPrice === null) {
    return null
  }

  if (
    minOriginalPrice === offer.minPrice &&
    maxOriginalPrice === offer.maxPrice
  ) {
    return null
  }

  if (minOriginalPrice === maxOriginalPrice) {
    return formatMoney(minOriginalPrice)
  }

  return `${formatMoney(minOriginalPrice)} – ${formatMoney(maxOriginalPrice)}`
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
