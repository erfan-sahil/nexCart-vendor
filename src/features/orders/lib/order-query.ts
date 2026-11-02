import { z } from "zod"

import {
  DEFAULT_ORDER_PAGE_SIZE,
  DEFAULT_ORDER_SORT,
  VENDOR_ORDER_SORTS,
  VENDOR_ORDER_STATUSES,
  type OrderStatusScope,
  statusesForScope,
} from "../constants"
import type { OrderListQuery, VendorOrder, VendorOrderStatus } from "../types"

const listParamsSchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
  search: z
    .string()
    .trim()
    .max(80)
    .optional()
    .catch(undefined)
    .transform((value) => (value ? value : undefined)),
  sort: z.enum(VENDOR_ORDER_SORTS).catch(DEFAULT_ORDER_SORT),
  status: z.enum(VENDOR_ORDER_STATUSES).optional().catch(undefined),
})

function readParam(params: URLSearchParams, key: string) {
  const value = params.get(key)
  return value === null || value.length === 0 ? undefined : value
}

export function parseOrderListParams(
  params: URLSearchParams,
  scope: OrderStatusScope = "all"
): OrderListQuery {
  const allowed = new Set(statusesForScope(scope))
  const parsed = listParamsSchema.parse({
    page: readParam(params, "page"),
    search: readParam(params, "search"),
    sort: readParam(params, "sort"),
    status: readParam(params, "status"),
  })

  const status =
    parsed.status && allowed.has(parsed.status) ? parsed.status : undefined

  return {
    page: parsed.page,
    limit: DEFAULT_ORDER_PAGE_SIZE,
    search: parsed.search,
    sort: parsed.sort,
    status,
  }
}

export function toOrderListSearchParams(query: OrderListQuery) {
  const params = new URLSearchParams()

  if (query.page > 1) {
    params.set("page", String(query.page))
  }

  if (query.search) {
    params.set("search", query.search)
  }

  if (query.sort !== DEFAULT_ORDER_SORT) {
    params.set("sort", query.sort)
  }

  if (query.status) {
    params.set("status", query.status)
  }

  return params
}

export function hasOrderFilters(query: OrderListQuery) {
  return Boolean(
    query.search || query.status || query.sort !== DEFAULT_ORDER_SORT
  )
}

export function matchesOrderSearch(order: VendorOrder, search: string) {
  const needle = search.trim().toLowerCase()

  if (!needle) {
    return true
  }

  return (
    order.vendorOrderNumber.toLowerCase().includes(needle) ||
    order.orderNumber.toLowerCase().includes(needle) ||
    order.items.some(
      (item) =>
        item.productName.toLowerCase().includes(needle) ||
        item.sku.toLowerCase().includes(needle)
    )
  )
}

export function isStatusInScope(
  status: VendorOrderStatus,
  scope: OrderStatusScope
) {
  return (statusesForScope(scope) as readonly VendorOrderStatus[]).includes(
    status
  )
}
