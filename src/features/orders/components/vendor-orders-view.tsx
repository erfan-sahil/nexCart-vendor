import { useCallback, useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"

import type { OrderStatusScope } from "../constants"
import { useOrderListParams } from "../hooks/use-order-list-params"
import { useVendorOrders } from "../hooks/use-vendor-orders"
import { formatResultRange } from "../lib/format"
import {
  hasOrderFilters,
  isStatusInScope,
  matchesOrderSearch,
} from "../lib/order-query"
import type { VendorOrder, VendorOrderSort, VendorOrderStatus } from "../types"

import { OrderDetailsDialog } from "./order-details-dialog"
import {
  OrderEmptyState,
  OrderErrorState,
  OrderTableSkeleton,
} from "./order-states"
import { OrderTable } from "./order-table"
import { OrderToolbar } from "./order-toolbar"

type VendorOrdersViewProps = {
  scope?: OrderStatusScope
}

export function VendorOrdersView({ scope = "all" }: VendorOrdersViewProps) {
  const [viewingId, setViewingId] = useState<string | null>(null)
  const { query, updateQuery, clearFilters } = useOrderListParams(scope)
  const needsClientStatusFilter = scope !== "all" && !query.status

  const listQuery = useVendorOrders({
    page: query.page,
    limit: query.limit,
    sort: query.sort,
    status: query.status,
  })

  const page = listQuery.data

  const visibleOrders = useMemo(() => {
    const rows = page?.items ?? []

    return rows.filter((order) => {
      if (needsClientStatusFilter && !isStatusInScope(order.status, scope)) {
        return false
      }

      if (query.search && !matchesOrderSearch(order, query.search)) {
        return false
      }

      return true
    })
  }, [needsClientStatusFilter, page?.items, query.search, scope])

  useEffect(() => {
    if (!page) {
      return
    }

    if (query.page > 1 && query.page > page.pagination.totalPages) {
      updateQuery({ page: Math.max(page.pagination.totalPages, 1) })
    }
  }, [page, query.page, updateQuery])

  const showSkeleton = listQuery.isPending
  const isEmpty = page !== undefined && visibleOrders.length === 0
  const filtered = hasOrderFilters(query) || scope !== "all"
  const displayTotal =
    query.search || needsClientStatusFilter
      ? visibleOrders.length
      : page?.pagination.total

  const changeSearch = useCallback(
    (search: string | undefined) => updateQuery({ search, page: 1 }),
    [updateQuery]
  )
  const changeStatus = useCallback(
    (status: VendorOrderStatus | undefined) => updateQuery({ status, page: 1 }),
    [updateQuery]
  )
  const changeSort = useCallback(
    (sort: VendorOrderSort) => updateQuery({ sort, page: 1 }),
    [updateQuery]
  )
  const openOrder = useCallback((order: VendorOrder) => {
    setViewingId(order.id)
  }, [])

  return (
    <section
      className="flex w-full flex-col gap-4"
      aria-busy={listQuery.isFetching}
    >
      <OrderToolbar
        scope={scope}
        query={query}
        total={displayTotal}
        onSearch={changeSearch}
        onStatus={changeStatus}
        onSort={changeSort}
        onClear={clearFilters}
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        {showSkeleton ? <OrderTableSkeleton /> : null}

        {listQuery.isError && !page ? (
          <OrderErrorState
            error={listQuery.error}
            onRetry={() => {
              void listQuery.refetch()
            }}
          />
        ) : null}

        {listQuery.isError && page ? (
          <p
            role="alert"
            className="border-b border-border px-4 py-2 text-sm text-destructive"
          >
            The latest order list could not be refreshed.
          </p>
        ) : null}

        {page && isEmpty ? <OrderEmptyState filtered={filtered} /> : null}

        {page && !isEmpty ? (
          <OrderTable
            orders={visibleOrders}
            isRefreshing={listQuery.isFetching && !listQuery.isPending}
            onView={openOrder}
          />
        ) : null}

        {page &&
        page.pagination.total > 0 &&
        !query.search &&
        !needsClientStatusFilter ? (
          <footer className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              {formatResultRange(
                page.pagination.page,
                page.pagination.limit,
                page.pagination.total
              )}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={query.page <= 1 || listQuery.isFetching}
                onClick={() => updateQuery({ page: query.page - 1 })}
              >
                <ChevronLeft />
                Previous
              </Button>
              <p className="min-w-16 text-center text-xs text-muted-foreground">
                {page.pagination.page} /{" "}
                {Math.max(page.pagination.totalPages, 1)}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={
                  query.page >= page.pagination.totalPages ||
                  listQuery.isFetching
                }
                onClick={() => updateQuery({ page: query.page + 1 })}
              >
                Next
                <ChevronRight />
              </Button>
            </div>
          </footer>
        ) : null}
      </div>

      <OrderDetailsDialog
        orderId={viewingId}
        onClose={() => setViewingId(null)}
      />
    </section>
  )
}
