import { api } from "@/lib/api/client"
import { ApiError, toApiError } from "@/lib/api/errors"
import type { ApiSuccess, PaginationMeta } from "@/lib/api/types"

import type {
  CreateProductPayload,
  UpdateProductPayload,
} from "../lib/create-product"
import type {
  Product,
  ProductListQuery,
  ProductPage,
  ProductVariant,
  ProductVariantPage,
} from "../types"

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

function readPagination(meta: ApiSuccess<unknown>["meta"]): PaginationMeta {
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

export async function uploadProductImage(file: File) {
  const body = new FormData()
  body.append("image", file, file.name)

  try {
    const { data } = await api.post<ApiSuccess<{ url: string }>>(
      "/products/image",
      body,
      {
        headers: { "Content-Type": "multipart/form-data" },
        transformRequest: (payload, headers) => {
          if (
            headers &&
            typeof headers === "object" &&
            "delete" in headers &&
            typeof headers.delete === "function"
          ) {
            headers.delete("Content-Type")
          }

          return payload
        },
      }
    )

    return data.data.url
  } catch (error) {
    throw toApiError(error)
  }
}

export async function createProduct(payload: CreateProductPayload) {
  try {
    const { data } = await api.post<ApiSuccess<Product>>("/products", payload)

    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function updateProduct(
  productId: string,
  payload: UpdateProductPayload
) {
  try {
    const { data } = await api.patch<ApiSuccess<Product>>(
      `/products/${productId}`,
      payload
    )

    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export type CreateVariantPayload = {
  sku: string
  price: number
  stock: number
  discountType?: "percent" | "amount"
  discountValue?: number
  isDefault: boolean
  simple?: boolean
  attributes?: {
    attributeId: string
    text?: string
    number?: number
    optionIds?: string[]
  }[]
}

export async function createVariant(
  productId: string,
  payload: CreateVariantPayload
) {
  try {
    const { data } = await api.post<ApiSuccess<{ id: string }>>(
      `/products/${productId}/variants`,
      payload
    )

    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function submitProduct(productId: string) {
  try {
    const { data } = await api.post<ApiSuccess<Product>>(
      `/products/${productId}/submit`
    )

    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function deleteProduct(productId: string) {
  try {
    const { data } = await api.delete<ApiSuccess<{ id: string }>>(
      `/products/${productId}`
    )

    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function listProductVariants(
  productId: string
): Promise<ProductVariantPage> {
  try {
    const { data } = await api.get<ApiSuccess<ProductVariant[]>>(
      `/products/${productId}/variants`,
      { params: { page: 1, limit: 100, sort: "sku" } }
    )

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
