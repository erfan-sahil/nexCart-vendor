import { z } from "zod"

import {
  DEFAULT_INVENTORY_PAGE_SIZE,
  DEFAULT_LOW_STOCK_AT,
  DEFAULT_PRODUCT_SORT,
  DEFAULT_VARIANT_SORT,
  INVENTORY_PRODUCT_SORTS,
  INVENTORY_VARIANT_SORTS,
  INVENTORY_VIEWS,
  MAX_LOW_STOCK_AT,
  PRODUCT_APPROVAL_STATUSES,
  PRODUCT_STATUSES,
  STOCK_LEVELS,
} from "../constants"
import type {
  InventoryListParams,
  InventoryProductQuery,
  InventoryProductSort,
  InventoryVariantQuery,
  InventoryVariantSort,
} from "../types"

const listParamsSchema = z.object({
  view: z.enum(INVENTORY_VIEWS).catch("products"),
  page: z.coerce.number().int().positive().catch(1),
  search: z
    .string()
    .trim()
    .max(80)
    .optional()
    .catch(undefined)
    .transform((value) => (value ? value : undefined)),
  stockLevel: z.enum(STOCK_LEVELS).optional().catch(undefined),
  lowStockAt: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_LOW_STOCK_AT)
    .catch(DEFAULT_LOW_STOCK_AT),
  sort: z.string().optional().catch(undefined),
  status: z.enum(PRODUCT_STATUSES).optional().catch(undefined),
  approvalStatus: z.enum(PRODUCT_APPROVAL_STATUSES).optional().catch(undefined),
})

function readParam(params: URLSearchParams, key: string) {
  const value = params.get(key)
  return value === null || value.length === 0 ? undefined : value
}

function isProductSort(
  value: string | undefined
): value is InventoryProductSort {
  return (
    value !== undefined &&
    (INVENTORY_PRODUCT_SORTS as readonly string[]).includes(value)
  )
}

function isVariantSort(
  value: string | undefined
): value is InventoryVariantSort {
  return (
    value !== undefined &&
    (INVENTORY_VARIANT_SORTS as readonly string[]).includes(value)
  )
}

export function parseInventoryParams(
  params: URLSearchParams
): InventoryListParams {
  const parsed = listParamsSchema.parse({
    view: readParam(params, "view"),
    page: readParam(params, "page"),
    search: readParam(params, "search"),
    stockLevel: readParam(params, "stockLevel"),
    lowStockAt: readParam(params, "lowStockAt"),
    sort: readParam(params, "sort"),
    status: readParam(params, "status"),
    approvalStatus: readParam(params, "approvalStatus"),
  })

  const sort =
    parsed.view === "products"
      ? isProductSort(parsed.sort)
        ? parsed.sort
        : DEFAULT_PRODUCT_SORT
      : isVariantSort(parsed.sort)
        ? parsed.sort
        : DEFAULT_VARIANT_SORT

  return {
    view: parsed.view,
    page: parsed.page,
    limit: DEFAULT_INVENTORY_PAGE_SIZE,
    search: parsed.search,
    stockLevel: parsed.stockLevel,
    lowStockAt: parsed.lowStockAt,
    sort,
    status: parsed.status,
    approvalStatus:
      parsed.view === "products" ? parsed.approvalStatus : undefined,
  }
}

export function toInventorySearchParams(query: InventoryListParams) {
  const params = new URLSearchParams()
  const defaultSort =
    query.view === "products" ? DEFAULT_PRODUCT_SORT : DEFAULT_VARIANT_SORT

  if (query.view !== "products") {
    params.set("view", query.view)
  }

  if (query.page > 1) {
    params.set("page", String(query.page))
  }

  if (query.search) {
    params.set("search", query.search)
  }

  if (query.stockLevel) {
    params.set("stockLevel", query.stockLevel)
  }

  if (query.lowStockAt !== DEFAULT_LOW_STOCK_AT) {
    params.set("lowStockAt", String(query.lowStockAt))
  }

  if (query.sort !== defaultSort) {
    params.set("sort", query.sort)
  }

  if (query.status) {
    params.set("status", query.status)
  }

  if (query.view === "products" && query.approvalStatus) {
    params.set("approvalStatus", query.approvalStatus)
  }

  return params
}

export function hasInventoryFilters(query: InventoryListParams) {
  const defaultSort =
    query.view === "products" ? DEFAULT_PRODUCT_SORT : DEFAULT_VARIANT_SORT

  return Boolean(
    query.search ||
    query.stockLevel ||
    query.status ||
    query.approvalStatus ||
    query.lowStockAt !== DEFAULT_LOW_STOCK_AT ||
    query.sort !== defaultSort
  )
}

export function toProductQuery(
  query: InventoryListParams
): InventoryProductQuery {
  return {
    page: query.page,
    limit: query.limit,
    search: query.search,
    sort: isProductSort(query.sort) ? query.sort : DEFAULT_PRODUCT_SORT,
    stockLevel: query.stockLevel,
    lowStockAt: query.lowStockAt,
    status: query.status,
    approvalStatus: query.approvalStatus,
  }
}

export function toVariantQuery(
  query: InventoryListParams
): InventoryVariantQuery {
  return {
    page: query.page,
    limit: query.limit,
    search: query.search,
    sort: isVariantSort(query.sort) ? query.sort : DEFAULT_VARIANT_SORT,
    stockLevel: query.stockLevel,
    lowStockAt: query.lowStockAt,
    status: query.status,
  }
}
