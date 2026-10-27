import { useCallback, useMemo } from "react"
import { useSearchParams } from "react-router"

import { DEFAULT_PRODUCT_SORT } from "../constants"
import {
  parseProductListParams,
  toProductListSearchParams,
} from "../lib/product-query"
import type { ProductListPatch } from "../types"

export function useProductListParams() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = useMemo(
    () => parseProductListParams(searchParams),
    [searchParams]
  )

  const updateQuery = useCallback(
    (patch: ProductListPatch) => {
      const next = toProductListSearchParams({
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
      sort: DEFAULT_PRODUCT_SORT,
      status: undefined,
      approvalStatus: undefined,
      isPublished: undefined,
    })
  }, [updateQuery])

  return { query, updateQuery, clearFilters }
}
