import { useCallback, useMemo } from "react"
import { useSearchParams } from "react-router"

import { VENDOR_ANALYTICS_RANGES, type VendorAnalyticsRange } from "../types"

const DEFAULT_RANGE: VendorAnalyticsRange = "30d"

function isAnalyticsRange(value: string | null): value is VendorAnalyticsRange {
  return VENDOR_ANALYTICS_RANGES.includes(value as VendorAnalyticsRange)
}

export function useAnalyticsRange() {
  const [searchParams, setSearchParams] = useSearchParams()

  const range = useMemo(() => {
    const param = searchParams.get("range")
    return isAnalyticsRange(param) ? param : DEFAULT_RANGE
  }, [searchParams])

  const setRange = useCallback(
    (next: VendorAnalyticsRange) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev)
          params.set("range", next)
          return params
        },
        { replace: true }
      )
    },
    [setSearchParams]
  )

  return { range, setRange }
}
