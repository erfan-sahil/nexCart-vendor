import { api } from "@/lib/api/client"
import { ApiError, toApiError } from "@/lib/api/errors"
import type { ApiSuccess, PaginationMeta } from "@/lib/api/types"

import type {
  InventoryPage,
  InventoryProduct,
  InventoryProductDetail,
  InventoryProductDetailQuery,
  InventoryProductQuery,
  InventorySummary,
  InventoryVariant,
  InventoryVariantQuery,
} from "../types"

function readPagination(meta: ApiSuccess<unknown>["meta"]): PaginationMeta {
  const pagination = meta?.pagination

  if (!pagination) {
    throw new ApiError(0, {
      success: false,
      message: "Inventory response is missing pagination.",
      code: "INVALID_RESPONSE",
    })
  }

  return pagination
}

function definedParams(params: Record<string, string | number | undefined>) {
  return Object.fromEntries(
    Object.entries(params).filter((entry) => entry[1] !== undefined)
  )
}

export async function getInventorySummary(lowStockAt: number) {
  try {
    const { data } = await api.get<ApiSuccess<InventorySummary>>(
      "/inventory/summary",
      { params: { lowStockAt } }
    )

    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function listInventoryProducts(
  query: InventoryProductQuery
): Promise<InventoryPage<InventoryProduct>> {
  try {
    const { data } = await api.get<ApiSuccess<InventoryProduct[]>>(
      "/inventory/products",
      {
        params: definedParams({
          page: query.page,
          limit: query.limit,
          sort: query.sort,
          search: query.search,
          stockLevel: query.stockLevel,
          lowStockAt: query.lowStockAt,
          status: query.status,
          approvalStatus: query.approvalStatus,
        }),
      }
    )

    return {
      items: data.data,
      pagination: readPagination(data.meta),
    }
  } catch (error) {
    throw toApiError(error)
  }
}

export async function listInventoryVariants(
  query: InventoryVariantQuery
): Promise<InventoryPage<InventoryVariant>> {
  try {
    const { data } = await api.get<ApiSuccess<InventoryVariant[]>>(
      "/inventory/variants",
      {
        params: definedParams({
          page: query.page,
          limit: query.limit,
          sort: query.sort,
          search: query.search,
          stockLevel: query.stockLevel,
          lowStockAt: query.lowStockAt,
          status: query.status,
          productId: query.productId,
        }),
      }
    )

    return {
      items: data.data,
      pagination: readPagination(data.meta),
    }
  } catch (error) {
    throw toApiError(error)
  }
}

export async function getInventoryProduct(
  productId: string,
  query: InventoryProductDetailQuery
): Promise<InventoryProductDetail> {
  try {
    const { data } = await api.get<
      ApiSuccess<{ product: InventoryProduct; variants: InventoryVariant[] }>
    >(`/inventory/products/${productId}`, {
      params: definedParams({
        page: query.page,
        limit: query.limit,
        sort: query.sort,
        search: query.search,
        stockLevel: query.stockLevel,
        lowStockAt: query.lowStockAt,
        status: query.status,
      }),
    })

    return {
      product: data.data.product,
      variants: data.data.variants,
      pagination: readPagination(data.meta),
    }
  } catch (error) {
    throw toApiError(error)
  }
}
