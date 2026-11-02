import { z } from "zod"

import {
  DEFAULT_ORDER_PAGE_SIZE,
  DEFAULT_ORDER_SORT,
  DEFAULT_ORDER_TAB,
  ORDER_STATUS_TABS,
  RETURNS_STATUSES,
  VENDOR_ORDER_SORTS,
  apiStatusForTab,
  statusesForTab,
  type OrderStatusTab,
} from "../constants"
import { normalizeVendorOrderStatus } from "./normalize-order-status"
import type { OrderListQuery, VendorOrder, VendorOrderStatus } from "../types"

const ORDER_TAB_VALUES = ORDER_STATUS_TABS.map((tab) => tab.value)

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
  tab: z
    .enum(ORDER_TAB_VALUES as [OrderStatusTab, ...OrderStatusTab[]])
    .catch(DEFAULT_ORDER_TAB),
})

function readParam(params: URLSearchParams, key: string) {
  const value = params.get(key)
  return value === null || value.length === 0 ? undefined : value
}

export function parseOrderListParams(params: URLSearchParams): OrderListQuery {
  const parsed = listParamsSchema.parse({
    page: readParam(params, "page"),
    search: readParam(params, "search"),
    sort: readParam(params, "sort"),
    tab: readParam(params, "tab"),
  })

  return {
    page: parsed.page,
    limit: DEFAULT_ORDER_PAGE_SIZE,
    search: parsed.search,
    sort: parsed.sort,
    tab: parsed.tab,
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

  if (query.tab !== DEFAULT_ORDER_TAB) {
    params.set("tab", query.tab)
  }

  return params
}

export function hasOrderFilters(query: OrderListQuery) {
  return Boolean(
    query.search ||
    query.tab !== DEFAULT_ORDER_TAB ||
    query.sort !== DEFAULT_ORDER_SORT
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

export function matchesOrderTab(
  status: VendorOrderStatus | string,
  tab: OrderStatusTab
) {
  const statuses = statusesForTab(tab)

  if (!statuses) {
    return true
  }

  const normalized = normalizeVendorOrderStatus(String(status))
  return statuses.includes(normalized)
}

export function matchesReturnsFilter(status: VendorOrderStatus | string) {
  const normalized = normalizeVendorOrderStatus(String(status))
  return (RETURNS_STATUSES as readonly VendorOrderStatus[]).includes(normalized)
}

export function listParamsForQuery(query: OrderListQuery) {
  return {
    page: query.page,
    limit: query.limit,
    sort: query.sort,
    status: apiStatusForTab(query.tab),
  }
}

export function needsClientTabFilter(tab: OrderStatusTab) {
  const statuses = statusesForTab(tab)
  return statuses !== null && statuses.length !== 1
}
