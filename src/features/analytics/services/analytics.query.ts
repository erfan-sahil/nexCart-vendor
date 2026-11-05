import type { VendorAnalyticsRange } from "../types/analytics.types"

export const analyticsKeys = {
  all: ["vendor-analytics"] as const,
  overview: (range: VendorAnalyticsRange) =>
    [...analyticsKeys.all, range] as const,
}
