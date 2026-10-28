import { useCallback, useMemo } from "react"
import { useSearchParams } from "react-router"

import {
  DEFAULT_LOW_STOCK_AT,
  DEFAULT_PRODUCT_SORT,
  DEFAULT_VARIANT_SORT,
} from "../constants"
import {
  hasInventoryFilters,
  parseInventoryParams,
  toInventorySearchParams,
} from "../lib/inventory-query"
import type { InventoryListPatch } from "../types"

export function useInventoryParams() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = useMemo(
    () => parseInventoryParams(searchParams),
    [searchParams]
  )

  const updateQuery = useCallback(
    (patch: InventoryListPatch) => {
      const next = toInventorySearchParams({
        ...query,
        ...patch,
        limit: query.limit,
      })
      setSearchParams(next, { replace: true })
    },
    [query, setSearchParams]
  )

  const clearFilters = useCallback(() => {
    updateQuery({
      page: 1,
      search: undefined,
      stockLevel: undefined,
      status: undefined,
      approvalStatus: undefined,
      lowStockAt: DEFAULT_LOW_STOCK_AT,
      sort:
        query.view === "products" ? DEFAULT_PRODUCT_SORT : DEFAULT_VARIANT_SORT,
    })
  }, [query.view, updateQuery])

  return {
    query,
    updateQuery,
    clearFilters,
    filtered: hasInventoryFilters(query),
  }
}
