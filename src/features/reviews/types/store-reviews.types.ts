import type { PaginationMeta } from "@/lib/api/types"

export type ReviewAuthor = {
  id: string
  displayName: string
  avatarUrl: string
}

export type ReviewReply = {
  id: string
  author: ReviewAuthor
  body: string
  createdAt: string
  updatedAt: string
  isMine: boolean
}

export type ReviewProductRef = {
  id: string
  name: string
  slug: string
}

export type ReviewStoreRef = {
  id: string
  name: string
}

export type StoreReview = {
  id: string
  rating: number
  body: string
  createdAt: string
  updatedAt: string
  author: ReviewAuthor
  product: ReviewProductRef
  store: ReviewStoreRef
  replyCount: number
  replies: ReviewReply[]
  hasVendorReply: boolean
}

export type ListStoreReviewsParams = {
  page?: number
  limit?: number
  rating?: number
  search?: string
}

export type ListStoreReviewsResult = {
  items: StoreReview[]
  pagination: PaginationMeta
}

export type RatingFilter = "all" | "1" | "2" | "3" | "4" | "5"
