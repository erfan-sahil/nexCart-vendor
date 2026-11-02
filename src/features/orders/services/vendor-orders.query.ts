import type { ListVendorOrdersParams } from "../types/vendor-orders.types"

export const vendorOrderKeys = {
  all: ["vendor-orders"] as const,
  list: (params: ListVendorOrdersParams) =>
    [...vendorOrderKeys.all, "list", params] as const,
  summary: () => [...vendorOrderKeys.all, "summary"] as const,
  detail: (id: string) => [...vendorOrderKeys.all, "detail", id] as const,
}
