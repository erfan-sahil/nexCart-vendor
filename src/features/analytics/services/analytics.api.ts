import { api } from "@/lib/api/client"
import { toApiError } from "@/lib/api/errors"
import type { ApiSuccess } from "@/lib/api/types"

import type {
  VendorAnalytics,
  VendorAnalyticsRange,
} from "../types/analytics.types"

export async function getVendorAnalytics(
  range: VendorAnalyticsRange = "30d"
): Promise<VendorAnalytics> {
  try {
    const { data } = await api.get<ApiSuccess<VendorAnalytics>>(
      "/vendor/analytics",
      { params: { range } }
    )
    return data.data
  } catch (error) {
    throw toApiError(error)
  }
}
