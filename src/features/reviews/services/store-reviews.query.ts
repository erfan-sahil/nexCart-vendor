import type { ListStoreReviewsParams } from "../types"

export const vendorReviewKeys = {
  all: ["vendor-reviews"] as const,
  lists: () => ["vendor-reviews", "list"] as const,
  list: (params: ListStoreReviewsParams) =>
    ["vendor-reviews", "list", params] as const,
}
