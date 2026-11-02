import { api } from "@/lib/api/client"
import { toApiError } from "@/lib/api/errors"
import type { ApiSuccess, PaginationMeta } from "@/lib/api/types"

import type {
  ListVendorOrdersParams,
  ListVendorOrdersResult,
  VendorOrder,
  VendorOrderDetail,
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
): Promise<VendorOrderDetail> {
  try {
    const { data } = await api.get<ApiSuccess<VendorOrderDetail>>(
      `/vendor/orders/${vendorOrderId}`
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}

export type UpdateVendorOrderStatusPayload = {
  status:
    | "accepted"
    | "cancelled"
    | "preparing"
    | "sending_to_warehouse"
    | "received_returned_rejects"
}

export async function updateVendorOrderStatus(
  vendorOrderId: string,
  payload: UpdateVendorOrderStatusPayload,
  idempotencyKey: string
) {
  try {
    const { data } = await api.post<ApiSuccess<VendorOrderDetail>>(
      `/vendor/orders/${vendorOrderId}/status`,
      payload,
      {
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
      }
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}
