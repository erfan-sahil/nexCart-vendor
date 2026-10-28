import type {
  InventoryProductDetailQuery,
  InventoryProductQuery,
  InventoryVariantQuery,
} from "../types"

export const inventoryKeys = {
  all: ["inventory"] as const,
  summaries: () => [...inventoryKeys.all, "summary"] as const,
  summary: (lowStockAt: number) =>
    [...inventoryKeys.summaries(), lowStockAt] as const,
  products: () => [...inventoryKeys.all, "products"] as const,
  productList: (query: InventoryProductQuery) =>
    [...inventoryKeys.products(), query] as const,
  variants: () => [...inventoryKeys.all, "variants"] as const,
  variantList: (query: InventoryVariantQuery) =>
    [...inventoryKeys.variants(), query] as const,
  details: () => [...inventoryKeys.all, "detail"] as const,
  detail: (productId: string, query: InventoryProductDetailQuery) =>
    [...inventoryKeys.details(), productId, query] as const,
}
