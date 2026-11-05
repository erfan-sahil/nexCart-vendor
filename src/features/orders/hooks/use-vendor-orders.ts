import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { inventoryKeys } from "@/features/inventory/services"
import { productKeys } from "@/features/products/services"

import {
  confirmVendorReturnReceipt,
  getVendorOrder,
  getVendorOrderSummary,
  listVendorOrders,
  updateVendorOrderStatus,
  vendorOrderKeys,
  type UpdateVendorOrderStatusPayload,
} from "../services"
import type { ListVendorOrdersParams } from "../types/vendor-orders.types"

export function useVendorOrders(params: ListVendorOrdersParams) {
  return useQuery({
    queryKey: vendorOrderKeys.list(params),
    queryFn: () => listVendorOrders(params),
    placeholderData: keepPreviousData,
    staleTime: 20_000,
  })
}

export function useVendorOrderSummary() {
  return useQuery({
    queryKey: vendorOrderKeys.summary(),
    queryFn: getVendorOrderSummary,
    staleTime: 20_000,
  })
}

export function useVendorOrder(vendorOrderId: string) {
  return useQuery({
    queryKey: vendorOrderKeys.detail(vendorOrderId),
    queryFn: () => getVendorOrder(vendorOrderId),
    enabled: vendorOrderId.length > 0,
  })
}

export function useVendorOrderActions() {
  const queryClient = useQueryClient()

  const updateStatus = useMutation({
    mutationFn: ({
      vendorOrderId,
      ...payload
    }: UpdateVendorOrderStatusPayload & { vendorOrderId: string }) =>
      updateVendorOrderStatus(vendorOrderId, payload, crypto.randomUUID()),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: vendorOrderKeys.all })
    },
  })

  const confirmVendorReturn = useMutation({
    mutationFn: (shipmentId: string) =>
      confirmVendorReturnReceipt(shipmentId, crypto.randomUUID()),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: vendorOrderKeys.all }),
        queryClient.invalidateQueries({ queryKey: inventoryKeys.all }),
        queryClient.invalidateQueries({ queryKey: productKeys.all }),
      ])
    },
  })

  return { updateStatus, confirmVendorReturn }
}
