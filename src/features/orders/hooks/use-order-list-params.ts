import { useCallback, useMemo } from "react"
import { useSearchParams } from "react-router"

import { DEFAULT_ORDER_SORT, type OrderStatusScope } from "../constants"
import {
  parseOrderListParams,
  toOrderListSearchParams,
} from "../lib/order-query"
import type { OrderListPatch } from "../types"

export function useOrderListParams(scope: OrderStatusScope = "all") {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = useMemo(
    () => parseOrderListParams(searchParams, scope),
    [scope, searchParams]
  )

  const updateQuery = useCallback(
    (patch: OrderListPatch) => {
      const next = toOrderListSearchParams({
        ...query,
        ...patch,
      })
      setSearchParams(next, { replace: true })
    },
    [query, setSearchParams]
  )

  const clearFilters = useCallback(() => {
    updateQuery({
      page: 1,
      search: undefined,
      sort: DEFAULT_ORDER_SORT,
      status: undefined,
    })
  }, [updateQuery])

  return { query, updateQuery, clearFilters }
}
