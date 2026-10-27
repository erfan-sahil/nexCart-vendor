import { api } from "@/lib/api/client"
import { ApiError, toApiError } from "@/lib/api/errors"
import type { ApiSuccess, PaginationMeta } from "@/lib/api/types"

import type { Product, ProductListQuery, ProductPage } from "../types"

function toListParams(query: ProductListQuery) {
  return {
    page: query.page,
    limit: query.limit,
    sort: query.sort,
    ...(query.search ? { search: query.search } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.approvalStatus ? { approvalStatus: query.approvalStatus } : {}),
    ...(query.isPublished === undefined
      ? {}
      : { isPublished: String(query.isPublished) }),
  }
}

function readPagination(meta: ApiSuccess<Product[]>["meta"]): PaginationMeta {
  const pagination = meta?.pagination

  if (!pagination) {
    throw new ApiError(0, {
      success: false,
      message: "Product list is missing pagination.",
      code: "INVALID_RESPONSE",
    })
  }

  return pagination
}

export async function listVendorProducts(
  query: ProductListQuery
): Promise<ProductPage> {
  try {
    const { data } = await api.get<ApiSuccess<Product[]>>("/products/mine", {
      params: toListParams(query),
    })

    return {
      items: data.data,
      pagination: readPagination(data.meta),
    }
  } catch (error) {
    throw toApiError(error)
  }
}

export async function getProduct(productId: string): Promise<Product> {
  try {
    const { data } = await api.get<ApiSuccess<Product>>(
      `/products/${productId}`
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}
