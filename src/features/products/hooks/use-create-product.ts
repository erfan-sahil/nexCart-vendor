import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { ApiError } from "@/lib/api/errors"

import type {
  CreateProductPayload,
  UpdateProductPayload,
} from "../lib/create-product"
import {
  catalogKeys,
  createProduct,
  createVariant,
  deleteProduct,
  getCategoryAttributes,
  getCategoryTree,
  getMyStore,
  productKeys,
  submitProduct,
  updateProduct,
  type CreateVariantPayload,
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

export function useCreateProductWithOffer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      product: CreateProductPayload
      variants: CreateVariantPayload[]
      submitForApproval: boolean
    }) => {
      const created = await createProduct(input.product)

      try {
        for (const variant of input.variants) {
          await createVariant(created.id, variant)
        }
      } catch (error) {
        await deleteProduct(created.id).catch(() => undefined)
        throw error
      }

      if (!input.submitForApproval) {
        return { product: created, approvalWarning: null as string | null }
      }

      try {
        const submitted = await submitProduct(created.id)
        return { product: submitted, approvalWarning: null as string | null }
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : "It could not be sent for approval."

        return {
          product: created,
          approvalWarning: `The product was saved, but it was not sent for approval. ${message}`,
        }
      }
    },
    onSuccess: ({ product }) => {
      queryClient.setQueryData(productKeys.detail(product.id), product)
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      productId,
      payload,
    }: {
      productId: string
      payload: UpdateProductPayload
    }) => updateProduct(productId, payload),
    onSuccess: (product) => {
      queryClient.setQueryData(productKeys.detail(product.id), product)
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (productId: string) => deleteProduct(productId),
    onSuccess: (_result, productId) => {
      queryClient.removeQueries({ queryKey: productKeys.detail(productId) })
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}
