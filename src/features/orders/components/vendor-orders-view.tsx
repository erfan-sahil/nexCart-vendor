import { useCallback, useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"

import { useOrderListParams } from "../hooks/use-order-list-params"
import { useVendorOrders } from "../hooks/use-vendor-orders"
import { formatResultRange } from "../lib/format"
import {
  hasOrderFilters,
  listParamsForQuery,
  matchesOrderSearch,
  matchesOrderTab,
  matchesReturnsFilter,
  needsClientTabFilter,
} from "../lib/order-query"
import type { VendorOrder, VendorOrderSort } from "../types"

import { OrderDetailsDialog } from "./order-details-dialog"
import {
  OrderEmptyState,
  OrderErrorState,
  OrderTableSkeleton,
} from "./order-states"
import { OrderStatusDialog } from "./order-status-dialog"
import { OrderStatusTabs } from "./order-status-tabs"
import { OrderTable } from "./order-table"
import { OrderToolbar } from "./order-toolbar"

type VendorOrdersViewProps = {
  variant?: "orders" | "returns"
}

export function VendorOrdersView({
  variant = "orders",
}: VendorOrdersViewProps) {
  const isReturns = variant === "returns"
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [statusOrder, setStatusOrder] = useState<VendorOrder | null>(null)
  const { query, updateQuery, clearFilters, setTab } = useOrderListParams()
  const clientTabFilter = !isReturns && needsClientTabFilter(query.tab)
  const clientReturnsFilter = isReturns

  const listQuery = useVendorOrders(
    isReturns
      ? {
          page: query.page,
          limit: query.limit,
          sort: query.sort,
        }
      : listParamsForQuery(query)
  )

  const page = listQuery.data

  const visibleOrders = useMemo(() => {
    const rows = page?.items ?? []

    return rows.filter((order) => {
      if (clientReturnsFilter && !matchesReturnsFilter(order.status)) {
        return false
      }

      if (clientTabFilter && !matchesOrderTab(order.status, query.tab)) {
        return false
      }

      if (query.search && !matchesOrderSearch(order, query.search)) {
        return false
      }

      return true
    })
  }, [
    clientReturnsFilter,
    clientTabFilter,
    page?.items,
    query.search,
    query.tab,
  ])

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
  const filtered = hasOrderFilters(query) || isReturns
  const displayTotal =
    query.search || clientTabFilter || clientReturnsFilter
      ? visibleOrders.length
      : page?.pagination.total

  const changeSearch = useCallback(
    (search: string | undefined) => updateQuery({ search, page: 1 }),
    [updateQuery]
  )
  const changeSort = useCallback(
    (sort: VendorOrderSort) => updateQuery({ sort, page: 1 }),
    [updateQuery]
  )
  const openOrder = useCallback((order: VendorOrder) => {
    setViewingId(order.id)
  }, [])
  const openStatusUpdate = useCallback((order: VendorOrder) => {
    setStatusOrder(order)
  }, [])

  const showPaginationFooter =
    page &&
    page.pagination.total > 0 &&
    !query.search &&
    !clientTabFilter &&
    !clientReturnsFilter

  return (
    <section
      className="flex w-full flex-col gap-4"
      aria-busy={listQuery.isFetching}
    >
      {!isReturns ? (
        <OrderStatusTabs value={query.tab} onChange={setTab} />
      ) : null}

      <OrderToolbar
        query={query}
        total={displayTotal}
        onSearch={changeSearch}
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

        {page && isEmpty ? (
          <OrderEmptyState
            filtered={filtered}
            message={
              isReturns
                ? "No returned-product orders need your attention."
                : undefined
            }
          />
        ) : null}

        {page && !isEmpty ? (
          <OrderTable
            orders={visibleOrders}
            isRefreshing={listQuery.isFetching && !listQuery.isPending}
            onView={openOrder}
            onUpdateStatus={openStatusUpdate}
          />
        ) : null}

        {showPaginationFooter ? (
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
      <OrderStatusDialog
        order={statusOrder}
        onClose={() => setStatusOrder(null)}
      />
    </section>
  )
}
