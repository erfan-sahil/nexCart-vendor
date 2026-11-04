import { api } from "@/lib/api/client"
import { toApiError } from "@/lib/api/errors"
import type { ApiSuccess, PaginationMeta } from "@/lib/api/types"

import type {
  ListStoreReviewsParams,
  ListStoreReviewsResult,
  ReviewReply,
  StoreReview,
} from "../types"

function cleanParams(params: ListStoreReviewsParams) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (value === undefined || value === null) {
        return false
      }

      if (typeof value === "string" && value.trim() === "") {
        return false
      }

      return true
    })
  )
}

export async function listStoreReviews(
  params: ListStoreReviewsParams = {}
): Promise<ListStoreReviewsResult> {
  try {
    const { data } = await api.get<ApiSuccess<StoreReview[]>>(
      "/vendor/reviews",
      { params: cleanParams(params) }
    )

    const pagination = data.meta?.pagination as PaginationMeta | undefined

    return {
      items: data.data,
      pagination: pagination ?? {
        page: params.page ?? 1,
        limit: params.limit ?? data.data.length,
        total: data.data.length,
        totalPages: 1,
      },
    }
  } catch (error) {
    throw toApiError(error)
  }
}

export async function createStoreReviewReply(input: {
  productId: string
  reviewId: string
  body: string
}) {
  try {
    const { data } = await api.post<ApiSuccess<{ reply: ReviewReply }>>(
      `/products/${input.productId}/reviews/${input.reviewId}/replies`,
      { body: input.body }
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}
