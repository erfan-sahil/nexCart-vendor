import { api } from "@/lib/api/client"
import { toApiError } from "@/lib/api/errors"
import type { ApiSuccess, PaginationMeta } from "@/lib/api/types"

import type { VendorReturnShipment } from "../types/vendor-orders.types"

export type ListVendorReturnShipmentsParams = {
  page?: number
  limit?: number
  status?: string
}

export type ListVendorReturnShipmentsResult = {
  items: VendorReturnShipment[]
  pagination: PaginationMeta
}

export async function listVendorReturnShipments(
  params: ListVendorReturnShipmentsParams = {}
): Promise<ListVendorReturnShipmentsResult> {
  try {
    const { data } = await api.get<ApiSuccess<VendorReturnShipment[]>>(
      "/vendor/vendor-return-shipments",
      { params }
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

export async function confirmVendorReturnReceipt(
  shipmentId: string,
  idempotencyKey: string
) {
  try {
    const { data } = await api.post<ApiSuccess<VendorReturnShipment>>(
      `/vendor/vendor-return-shipments/${shipmentId}/confirm-receipt`,
      {},
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
