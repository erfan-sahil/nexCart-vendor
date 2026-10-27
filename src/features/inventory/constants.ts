export const STOCK_LEVELS = ["in_stock", "low_stock", "out_of_stock"] as const

export const INVENTORY_VIEWS = ["products", "variants"] as const

export const PRODUCT_STATUSES = ["active", "archived"] as const

export const PRODUCT_APPROVAL_STATUSES = [
  "pending",
  "submitted",
  "approved",
  "rejected",
] as const

export const INVENTORY_PRODUCT_SORTS = [
  "-updatedAt",
  "updatedAt",
  "name",
  "-name",
  "-totalStock",
  "totalStock",
  "-sellableStock",
  "sellableStock",
] as const

export const INVENTORY_VARIANT_SORTS = [
  "-updatedAt",
  "updatedAt",
  "sku",
  "-sku",
  "-stock",
  "stock",
  "-price",
  "price",
] as const

export const LOW_STOCK_PRESETS = [5, 10, 25] as const

export const DEFAULT_LOW_STOCK_AT = 5

export const MAX_LOW_STOCK_AT = 10_000

export const DEFAULT_INVENTORY_PAGE_SIZE = 20

export const DEFAULT_PRODUCT_SORT = "-updatedAt" as const

export const DEFAULT_VARIANT_SORT = "-updatedAt" as const

export const STOCK_LEVEL_LABEL = {
  in_stock: "In stock",
  low_stock: "Low stock",
  out_of_stock: "Out of stock",
} as const

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
  "-updatedAt": "Recently updated",
  updatedAt: "Least recently updated",
  name: "Name A–Z",
  "-name": "Name Z–A",
  "-totalStock": "Highest stock",
  totalStock: "Lowest stock",
  "-sellableStock": "Highest sellable",
  sellableStock: "Lowest sellable",
} as const

export const VARIANT_SORT_LABEL = {
  "-updatedAt": "Recently updated",
  updatedAt: "Least recently updated",
  sku: "SKU A–Z",
  "-sku": "SKU Z–A",
  "-stock": "Highest stock",
  stock: "Lowest stock",
  "-price": "Highest price",
  price: "Lowest price",
} as const
