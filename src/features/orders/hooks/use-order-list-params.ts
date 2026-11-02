import { useCallback, useMemo } from "react"
import { useSearchParams } from "react-router"

import {
  DEFAULT_ORDER_SORT,
  DEFAULT_ORDER_TAB,
  type OrderStatusTab,
} from "../constants"
import {
  parseOrderListParams,
  toOrderListSearchParams,
} from "../lib/order-query"
import type { OrderListPatch } from "../types"

export function useOrderListParams() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = useMemo(
    () => parseOrderListParams(searchParams),
    [searchParams]
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
      tab: DEFAULT_ORDER_TAB,
    })
  }, [updateQuery])

  const setTab = useCallback(
    (tab: OrderStatusTab) => {
      updateQuery({ tab, page: 1 })
    },
    [updateQuery]
  )

  return { query, updateQuery, clearFilters, setTab }
}
