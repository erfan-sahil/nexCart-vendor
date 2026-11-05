import { api } from "@/lib/api/client"
import { toApiError } from "@/lib/api/errors"
import type { ApiSuccess } from "@/lib/api/types"

import type {
  VendorDashboardOverview,
  VendorDashboardRange,
} from "../types/dashboard.types"

export async function getVendorDashboardOverview(
  range: VendorDashboardRange = "7d"
): Promise<VendorDashboardOverview> {
  try {
    const { data } = await api.get<ApiSuccess<VendorDashboardOverview>>(
      "/vendor/dashboard/overview",
      { params: { range } }
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}
