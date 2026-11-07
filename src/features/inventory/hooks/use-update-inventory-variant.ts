import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  getProductVariant,
  productKeys,
  updateVariant,
  type UpdateVariantPayload,
} from "@/features/products/services"

import { inventoryKeys } from "../services"

export function useInventoryVariantRecord(
  productId: string,
  variantId: string
) {
  return useQuery({
    queryKey: [...productKeys.variants(productId), variantId],
    queryFn: () => getProductVariant(productId, variantId),
    enabled: productId.length > 0 && variantId.length > 0,
  })
}

export function useUpdateInventoryVariant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      productId,
      variantId,
      payload,
    }: {
      productId: string
      variantId: string
      payload: UpdateVariantPayload
    }) => updateVariant(productId, variantId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
      void queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}
