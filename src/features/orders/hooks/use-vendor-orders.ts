import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  acceptVendorOrder,
  getVendorOrder,
  getVendorOrderSummary,
  listVendorOrders,
  prepareVendorOrder,
  readyVendorOrder,
  vendorOrderKeys,
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

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: vendorOrderKeys.all })
  }

  const accept = useMutation({
    mutationFn: acceptVendorOrder,
    onSuccess: invalidate,
  })

  const prepare = useMutation({
    mutationFn: prepareVendorOrder,
    onSuccess: invalidate,
  })

  const ready = useMutation({
    mutationFn: readyVendorOrder,
    onSuccess: invalidate,
  })

  return { accept, prepare, ready }
}
