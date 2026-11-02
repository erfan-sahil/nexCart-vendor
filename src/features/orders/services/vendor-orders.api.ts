import { api } from "@/lib/api/client"
import { toApiError } from "@/lib/api/errors"
import type { ApiSuccess, PaginationMeta } from "@/lib/api/types"

import type {
  ListVendorOrdersParams,
  ListVendorOrdersResult,
  VendorOrder,
  VendorOrderSummary,
} from "../types/vendor-orders.types"

export async function listVendorOrders(
  params: ListVendorOrdersParams = {}
): Promise<ListVendorOrdersResult> {
  try {
    const { data } = await api.get<ApiSuccess<VendorOrder[]>>(
      "/vendor/orders",
      {
        params,
      }
    )

    return {
      items: data.data,
      pagination: data.meta?.pagination as PaginationMeta,
    }
  } catch (error) {
    throw toApiError(error)
  }
}

export async function getVendorOrderSummary(): Promise<VendorOrderSummary> {
  try {
    const { data } = await api.get<ApiSuccess<VendorOrderSummary>>(
      "/vendor/orders/summary"
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function getVendorOrder(
  vendorOrderId: string
): Promise<VendorOrder> {
  try {
    const { data } = await api.get<ApiSuccess<VendorOrder>>(
      `/vendor/orders/${vendorOrderId}`
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function acceptVendorOrder(vendorOrderId: string) {
  try {
    const { data } = await api.post<ApiSuccess<VendorOrder>>(
      `/vendor/orders/${vendorOrderId}/accept`
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function prepareVendorOrder(vendorOrderId: string) {
  try {
    const { data } = await api.post<ApiSuccess<VendorOrder>>(
      `/vendor/orders/${vendorOrderId}/prepare`
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function readyVendorOrder(vendorOrderId: string) {
  try {
    const { data } = await api.post<ApiSuccess<VendorOrder>>(
      `/vendor/orders/${vendorOrderId}/ready`
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function dispatchInbound(
  vendorOrderId: string,
  payload: { inboundCarrier: string; inboundTracking: string }
) {
  try {
    const { data } = await api.post<ApiSuccess<VendorOrder>>(
      `/vendor/orders/${vendorOrderId}/inbound`,
      payload
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}
