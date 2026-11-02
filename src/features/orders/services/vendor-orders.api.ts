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

    const pagination = data.meta?.pagination as PaginationMeta | undefined

    return {
      items: data.data,
      pagination: {
        page: pagination?.page ?? params.page ?? 1,
        limit: pagination?.limit ?? params.limit ?? 20,
        total: pagination?.total ?? data.data.length,
        totalPages:
          pagination?.totalPages ??
          Math.max(
            1,
            Math.ceil(
              (pagination?.total ?? data.data.length) /
                (pagination?.limit ?? params.limit ?? 20)
            )
          ),
      },
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
