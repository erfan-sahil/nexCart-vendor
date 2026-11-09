import { useMutation, useQueryClient } from "@tanstack/react-query"

import {
  addProductImages,
  productKeys,
  removeProductImage,
  setProductThumbnail,
} from "../services"
import type { Product } from "../types"

function useSyncProduct() {
  const queryClient = useQueryClient()

  return (product: Product) => {
    queryClient.setQueryData(productKeys.detail(product.id), product)
    void queryClient.invalidateQueries({ queryKey: productKeys.lists() })
  }
}

export function useAddProductImages(productId: string) {
  const sync = useSyncProduct()

  return useMutation({
    mutationFn: (files: File[]) => addProductImages(productId, files),
    onSuccess: sync,
  })
}

export function useRemoveProductImage(productId: string) {
  const queryClient = useQueryClient()
  const sync = useSyncProduct()

  return useMutation({
    mutationFn: (imageId: string) => removeProductImage(productId, imageId),
    onSuccess: (product) => {
      sync(product)
      // The API unlinks the image from any variant that used it.
      void queryClient.invalidateQueries({
        queryKey: productKeys.variants(productId),
      })
    },
  })
}

export function useSetProductThumbnail(productId: string) {
  const sync = useSyncProduct()

  return useMutation({
    mutationFn: (imageId: string) => setProductThumbnail(productId, imageId),
    onSuccess: sync,
  })
}
