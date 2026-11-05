import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { analyticsKeys, getVendorAnalytics } from "../services"
import type { VendorAnalyticsRange } from "../types"

export function useVendorAnalytics(range: VendorAnalyticsRange) {
  return useQuery({
    queryKey: analyticsKeys.overview(range),
    queryFn: () => getVendorAnalytics(range),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  })
}
