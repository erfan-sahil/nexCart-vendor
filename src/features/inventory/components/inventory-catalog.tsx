import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router"

import { DEFAULT_PRODUCT_SORT, DEFAULT_VARIANT_SORT } from "../constants"
import {
  useInventoryParams,
  useInventoryProducts,
  useInventorySummary,
  useInventoryVariants,
} from "../hooks"
import type {
  CatalogStatus,
  InventoryProductSort,
  InventoryVariantSort,
  InventoryView,
  ProductApprovalStatus,
  StockLevel,
} from "../types"

import { InventoryProductDialog } from "./inventory-product-dialog"
import { InventoryProductTable } from "./inventory-product-table"
import {
  InventoryEmptyState,
  InventoryErrorState,
  InventoryPagination,
  InventoryTableSkeleton,
} from "./inventory-states"
import { InventorySummaryBar } from "./inventory-summary"
import { InventoryToolbar } from "./inventory-toolbar"
import { InventoryVariantTable } from "./inventory-variant-table"

export function InventoryCatalog() {
  const navigate = useNavigate()
  const [productId, setProductId] = useState<string | null>(null)
  const { query, updateQuery, clearFilters, filtered } = useInventoryParams()
  const summary = useInventorySummary(query.lowStockAt)
  const products = useInventoryProducts(query)
  const variants = useInventoryVariants(query)
  const active = query.view === "products" ? products : variants
  const page = active.data

  useEffect(() => {
    if (!page) {
      return
    }

    if (query.page > 1 && query.page > page.pagination.totalPages) {
      updateQuery({ page: Math.max(page.pagination.totalPages, 1) })
    }
  }, [page, query.page, updateQuery])

  const changeSearch = useCallback(
    (search: string | undefined) => updateQuery({ search, page: 1 }),
    [updateQuery]
  )
  const changeView = useCallback(
    (view: InventoryView) =>
      updateQuery({
        view,
        page: 1,
        sort: view === "products" ? DEFAULT_PRODUCT_SORT : DEFAULT_VARIANT_SORT,
        approvalStatus: view === "products" ? query.approvalStatus : undefined,
      }),
    [query.approvalStatus, updateQuery]
  )
  const changeStockLevel = useCallback(
    (stockLevel: StockLevel | undefined) =>
      updateQuery({ stockLevel, page: 1 }),
    [updateQuery]
  )
  const changeStatus = useCallback(
    (status: CatalogStatus | undefined) => updateQuery({ status, page: 1 }),
    [updateQuery]
  )
  const changeApproval = useCallback(
    (approvalStatus: ProductApprovalStatus | undefined) =>
      updateQuery({ approvalStatus, page: 1 }),
    [updateQuery]
  )
  const changeLowStockAt = useCallback(
    (lowStockAt: number) => updateQuery({ lowStockAt, page: 1 }),
    [updateQuery]
  )
  const changeSort = useCallback(
    (sort: InventoryProductSort | InventoryVariantSort) =>
      updateQuery({ sort, page: 1 }),
    [updateQuery]
  )

  const showSkeleton = active.isPending
  const isEmpty = page !== undefined && page.items.length === 0

  return (
    <section
      className="flex w-full flex-col gap-4"
      aria-busy={active.isFetching}
    >
      <InventorySummaryBar
        summary={summary.data}
        isPending={summary.isPending}
        error={summary.error}
        stockLevel={query.stockLevel}
        onStockLevel={changeStockLevel}
        onRetry={() => {
          void summary.refetch()
        }}
      />

      <InventoryToolbar
        query={query}
        total={page?.pagination.total}
        onSearch={changeSearch}
        onView={changeView}
        onStockLevel={changeStockLevel}
        onStatus={changeStatus}
        onApprovalStatus={changeApproval}
        onLowStockAt={changeLowStockAt}
        onSort={changeSort}
        onClear={clearFilters}
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        {showSkeleton ? <InventoryTableSkeleton /> : null}

        {active.isError && !page ? (
          <InventoryErrorState
            error={active.error}
            onRetry={() => {
              void active.refetch()
            }}
          />
        ) : null}

        {active.isError && page ? (
          <p
            role="alert"
            className="border-b border-border px-4 py-2 text-sm text-destructive"
          >
            The latest inventory could not be refreshed.
          </p>
        ) : null}

        {page && isEmpty ? (
          <InventoryEmptyState filtered={filtered} view={query.view} />
        ) : null}

        {page && !isEmpty && query.view === "products" && products.data ? (
          <InventoryProductTable
            products={products.data.items}
            isRefreshing={products.isFetching && !products.isPending}
            onOpen={setProductId}
            onEdit={(id) => navigate(`/store/products/${id}/edit`)}
          />
        ) : null}

        {page && !isEmpty && query.view === "variants" && variants.data ? (
          <InventoryVariantTable
            variants={variants.data.items}
            isRefreshing={variants.isFetching && !variants.isPending}
            onOpen={setProductId}
          />
        ) : null}

        {page ? (
          <InventoryPagination
            page={page.pagination.page}
            totalPages={page.pagination.totalPages}
            total={page.pagination.total}
            limit={page.pagination.limit}
            disabled={active.isFetching}
            onPage={(nextPage) => updateQuery({ page: nextPage })}
          />
        ) : null}
      </div>

      <InventoryProductDialog
        productId={productId}
        lowStockAt={query.lowStockAt}
        onClose={() => setProductId(null)}
      />
    </section>
  )
}
