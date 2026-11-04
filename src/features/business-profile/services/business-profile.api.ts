import { api } from "@/lib/api/client"
import { toApiError } from "@/lib/api/errors"
import type { ApiSuccess } from "@/lib/api/types"

import type { VendorApplication } from "../types"

export async function getMyVendorApplication() {
  try {
    const { data } = await api.get<ApiSuccess<VendorApplication>>(
      "/vendor-applications/me"
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}
