import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { getProduct, listVendorProducts, productKeys } from "../services"
import type { ProductListQuery } from "../types"

export function useVendorProducts(query: ProductListQuery) {
  return useQuery({
    queryKey: productKeys.list(query),
    queryFn: () => listVendorProducts(query),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}

export function useProduct(productId: string) {
  return useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: () => getProduct(productId),
    enabled: productId.length > 0,
  })
}
