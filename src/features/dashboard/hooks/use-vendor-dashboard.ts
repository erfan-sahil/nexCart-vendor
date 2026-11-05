import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { dashboardKeys, getVendorDashboardOverview } from "../services"
import type { VendorDashboardRange } from "../types"

export function useVendorDashboard(range: VendorDashboardRange) {
  return useQuery({
    queryKey: dashboardKeys.overview(range),
    queryFn: () => getVendorDashboardOverview(range),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  })
}
