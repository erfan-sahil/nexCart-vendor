import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { CreateProductPayload } from "../lib/create-product"
import {
  catalogKeys,
  createProduct,
  getCategoryAttributes,
  getCategoryTree,
  getMyStore,
  productKeys,
} from "../services"

export function useVendorStore(enabled: boolean) {
  return useQuery({
    queryKey: catalogKeys.store,
    queryFn: getMyStore,
    enabled,
    staleTime: 60_000,
  })
}

export function useCategoryTree(enabled: boolean) {
  return useQuery({
    queryKey: catalogKeys.tree,
    queryFn: getCategoryTree,
    enabled,
    staleTime: 60_000,
  })
}

export function useCategoryAttributes(categoryId: string) {
  return useQuery({
    queryKey: catalogKeys.attributes(categoryId),
    queryFn: () => getCategoryAttributes(categoryId),
    enabled: /^[a-f\d]{24}$/i.test(categoryId),
    staleTime: 60_000,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateProductPayload) => createProduct(payload),
    onSuccess: (product) => {
      queryClient.setQueryData(productKeys.detail(product.id), product)
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}
