import { z } from "zod"

import {
  DEFAULT_PRODUCT_PAGE_SIZE,
  DEFAULT_PRODUCT_SORT,
  PRODUCT_APPROVAL_STATUSES,
  PRODUCT_SORTS,
  PRODUCT_STATUSES,
} from "../constants"
import type { ProductListQuery } from "../types"

const listParamsSchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
  search: z
    .string()
    .trim()
    .max(80)
    .optional()
    .catch(undefined)
    .transform((value) => (value ? value : undefined)),
  sort: z.enum(PRODUCT_SORTS).catch(DEFAULT_PRODUCT_SORT),
  status: z.enum(PRODUCT_STATUSES).optional().catch(undefined),
  approvalStatus: z.enum(PRODUCT_APPROVAL_STATUSES).optional().catch(undefined),
  isPublished: z.enum(["true", "false"]).optional().catch(undefined),
})

function readParam(params: URLSearchParams, key: string) {
  const value = params.get(key)
  return value === null || value.length === 0 ? undefined : value
}

export function parseProductListParams(
  params: URLSearchParams
): ProductListQuery {
  const parsed = listParamsSchema.parse({
    page: readParam(params, "page"),
    search: readParam(params, "search"),
    sort: readParam(params, "sort"),
    status: readParam(params, "status"),
    approvalStatus: readParam(params, "approvalStatus"),
    isPublished: readParam(params, "isPublished"),
  })

  return {
    page: parsed.page,
    limit: DEFAULT_PRODUCT_PAGE_SIZE,
    search: parsed.search,
    sort: parsed.sort,
    status: parsed.status,
    approvalStatus: parsed.approvalStatus,
    isPublished:
      parsed.isPublished === undefined
        ? undefined
        : parsed.isPublished === "true",
  }
}

export function toProductListSearchParams(query: ProductListQuery) {
  const params = new URLSearchParams()

  if (query.page > 1) {
    params.set("page", String(query.page))
  }

  if (query.search) {
    params.set("search", query.search)
  }

  if (query.sort !== DEFAULT_PRODUCT_SORT) {
    params.set("sort", query.sort)
  }

  if (query.status) {
    params.set("status", query.status)
  }

  if (query.approvalStatus) {
    params.set("approvalStatus", query.approvalStatus)
  }

  if (query.isPublished !== undefined) {
    params.set("isPublished", String(query.isPublished))
  }

  return params
}

export function hasProductFilters(query: ProductListQuery) {
  return Boolean(
    query.search ||
    query.status ||
    query.approvalStatus ||
    query.isPublished !== undefined ||
    query.sort !== DEFAULT_PRODUCT_SORT
  )
}
