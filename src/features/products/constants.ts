export const PRODUCT_STATUSES = ["active", "archived"] as const

export const PRODUCT_APPROVAL_STATUSES = [
  "pending",
  "submitted",
  "approved",
  "rejected",
] as const

export const PRODUCT_SORTS = [
  "-createdAt",
  "createdAt",
  "name",
  "-name",
  "-rating",
  "rating",
] as const

export const DEFAULT_PRODUCT_SORT = "-createdAt" as const

export const DEFAULT_PRODUCT_PAGE_SIZE = 20

export const PRODUCT_STATUS_LABEL = {
  active: "Active",
  archived: "Archived",
} as const

export const PRODUCT_APPROVAL_LABEL = {
  pending: "Pending",
  submitted: "Submitted",
  approved: "Approved",
  rejected: "Rejected",
} as const

export const PRODUCT_SORT_LABEL = {
  "-createdAt": "Newest",
  createdAt: "Oldest",
  name: "Name A–Z",
  "-name": "Name Z–A",
  "-rating": "Highest rated",
  rating: "Lowest rated",
} as const
