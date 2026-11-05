export {
  formatMoney,
  formatCompactMoney,
  formatPercent,
  formatBucketLabel,
} from "@/lib/format"

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

export function formatOrderDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "—"
  }

  return dateFormat.format(date)
}

export function formatOrderDateTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "—"
  }

  return dateTimeFormat.format(date)
}

export function formatItemCount(count: number) {
  return count === 1 ? "1 item" : `${count} items`
}

export function formatResultRange(page: number, limit: number, total: number) {
  if (total === 0) {
    return "0 orders"
  }

  const start = (page - 1) * limit + 1
  const end = Math.min(page * limit, total)
  return `${start}–${end} of ${total}`
}
