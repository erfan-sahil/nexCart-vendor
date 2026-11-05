import type { VendorDashboardRange } from "../types/dashboard.types"

export const dashboardKeys = {
  all: ["vendor-dashboard"] as const,
  overview: (range: VendorDashboardRange) =>
    [...dashboardKeys.all, "overview", range] as const,
}
