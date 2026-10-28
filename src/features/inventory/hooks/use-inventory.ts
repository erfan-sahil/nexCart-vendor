import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { toProductQuery, toVariantQuery } from "../lib/inventory-query"
import {
  getInventoryProduct,
  getInventorySummary,
  inventoryKeys,
  listInventoryProducts,
  listInventoryVariants,
} from "../services"
import type { InventoryListParams, InventoryProductDetailQuery } from "../types"

export function useInventorySummary(lowStockAt: number) {
  return useQuery({
    queryKey: inventoryKeys.summary(lowStockAt),
    queryFn: () => getInventorySummary(lowStockAt),
    staleTime: 30_000,
  })
}

export function useInventoryProducts(query: InventoryListParams) {
  const listQuery = toProductQuery(query)

  return useQuery({
    queryKey: inventoryKeys.productList(listQuery),
    queryFn: () => listInventoryProducts(listQuery),
    enabled: query.view === "products",
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}

export function useInventoryVariants(query: InventoryListParams) {
  const listQuery = toVariantQuery(query)

  return useQuery({
    queryKey: inventoryKeys.variantList(listQuery),
    queryFn: () => listInventoryVariants(listQuery),
    enabled: query.view === "variants",
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}

export function useInventoryProduct(
  productId: string,
  query: InventoryProductDetailQuery
) {
  return useQuery({
    queryKey: inventoryKeys.detail(productId, query),
    queryFn: () => getInventoryProduct(productId, query),
    enabled: productId.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}
