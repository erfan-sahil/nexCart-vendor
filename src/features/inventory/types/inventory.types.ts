import type { PaginationMeta } from "@/lib/api/types"

import type {
  INVENTORY_PRODUCT_SORTS,
  INVENTORY_VARIANT_SORTS,
  INVENTORY_VIEWS,
  PRODUCT_APPROVAL_STATUSES,
  PRODUCT_STATUSES,
  STOCK_LEVELS,
} from "../constants"

export type StockLevel = (typeof STOCK_LEVELS)[number]

export type InventoryView = (typeof INVENTORY_VIEWS)[number]

export type CatalogStatus = (typeof PRODUCT_STATUSES)[number]

export type ProductApprovalStatus = (typeof PRODUCT_APPROVAL_STATUSES)[number]

export type InventoryProductSort = (typeof INVENTORY_PRODUCT_SORTS)[number]

export type InventoryVariantSort = (typeof INVENTORY_VARIANT_SORTS)[number]

export type InventoryRef = {
  id: string
  name: string
  slug: string
}

export type InventoryImage = {
  id: string
  url: string
  alt: string
}

export type InventoryOption = {
  name: string
  value: string
}

export type InventoryProduct = {
  id: string
  name: string
  slug: string
  status: CatalogStatus
  approvalStatus: ProductApprovalStatus
  isPublished: boolean
  thumbnail: InventoryImage | null
  store: InventoryRef
  category: InventoryRef
  defaultSku: string | null
  minPrice: number | null
  maxPrice: number | null
  variantCount: number
  activeVariantCount: number
  totalStock: number
  sellableStock: number
  lowStockVariantCount: number
  outOfStockVariantCount: number
  stockLevel: StockLevel
  lowStockAt: number
  updatedAt: string
}

export type InventoryVariant = {
  id: string
  sku: string
  price: number
  currentPrice: number
  stock: number
  stockLevel: StockLevel
  lowStockAt: number
  status: CatalogStatus
  isDefault: boolean
  options: InventoryOption[]
  product: InventoryRef & {
    status: CatalogStatus
  }
  store: InventoryRef
  createdAt: string
  updatedAt: string
}

export type InventorySummary = {
  lowStockAt: number
  productCount: number
  variantCount: number
  totalUnits: number
  sellableUnits: number
  products: {
    inStock: number
    lowStock: number
    outOfStock: number
  }
  variants: {
    inStock: number
    lowStock: number
    outOfStock: number
  }
}

export type InventoryListParams = {
  view: InventoryView
  page: number
  limit: number
  search?: string
  stockLevel?: StockLevel
  lowStockAt: number
  sort: InventoryProductSort | InventoryVariantSort
  status?: CatalogStatus
  approvalStatus?: ProductApprovalStatus
}

export type InventoryListPatch = Partial<Omit<InventoryListParams, "limit">>

export type InventoryProductQuery = {
  page: number
  limit: number
  search?: string
  sort: InventoryProductSort
  stockLevel?: StockLevel
  lowStockAt: number
  status?: CatalogStatus
  approvalStatus?: ProductApprovalStatus
}

export type InventoryVariantQuery = {
  page: number
  limit: number
  search?: string
  sort: InventoryVariantSort
  stockLevel?: StockLevel
  lowStockAt: number
  status?: CatalogStatus
  productId?: string
}

export type InventoryProductDetailQuery = {
  page: number
  limit: number
  lowStockAt: number
  sort: InventoryVariantSort
  stockLevel?: StockLevel
  status?: CatalogStatus
  search?: string
}

export type InventoryPage<T> = {
  items: T[]
  pagination: PaginationMeta
}

export type InventoryProductDetail = {
  product: InventoryProduct
  variants: InventoryVariant[]
  pagination: PaginationMeta
}
