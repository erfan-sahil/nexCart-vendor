import { useCallback, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"

import { useProductListParams, useVendorProducts } from "../hooks"
import { formatResultRange } from "../lib/format"
import { hasProductFilters } from "../lib/product-query"
import type {
  ProductApprovalStatus,
  ProductSort,
  ProductStatus,
} from "../types"

import {
  ProductEmptyState,
  ProductErrorState,
  ProductTableSkeleton,
} from "./product-states"
import { ProductTable } from "./product-table"
import { ProductToolbar } from "./product-toolbar"

export function ProductCatalog() {
  const { query, updateQuery, clearFilters } = useProductListParams()
  const products = useVendorProducts(query)
  const page = products.data

  useEffect(() => {
    if (!page) {
      return
    }

    if (query.page > 1 && query.page > page.pagination.totalPages) {
      updateQuery({ page: Math.max(page.pagination.totalPages, 1) })
    }
  }, [page, query.page, updateQuery])

  const showSkeleton = products.isPending
  const isEmpty = page !== undefined && page.items.length === 0
  const filtered = hasProductFilters(query)

  const changeSearch = useCallback(
    (search: string | undefined) => updateQuery({ search, page: 1 }),
    [updateQuery]
  )
  const changeStatus = useCallback(
    (status: ProductStatus | undefined) => updateQuery({ status, page: 1 }),
    [updateQuery]
  )
  const changeApproval = useCallback(
    (approvalStatus: ProductApprovalStatus | undefined) =>
      updateQuery({ approvalStatus, page: 1 }),
    [updateQuery]
  )
  const changePublished = useCallback(
    (isPublished: boolean | undefined) => updateQuery({ isPublished, page: 1 }),
    [updateQuery]
  )
  const changeSort = useCallback(
    (sort: ProductSort) => updateQuery({ sort, page: 1 }),
    [updateQuery]
  )

  return (
    <section
      className="mx-auto flex w-full max-w-6xl flex-col gap-4"
      aria-busy={products.isFetching}
    >
      <ProductToolbar
        query={query}
        total={page?.pagination.total}
        onSearch={changeSearch}
        onStatus={changeStatus}
        onApprovalStatus={changeApproval}
        onPublished={changePublished}
        onSort={changeSort}
        onClear={clearFilters}
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        {showSkeleton ? <ProductTableSkeleton /> : null}

        {products.isError && !page ? (
          <ProductErrorState
            error={products.error}
            onRetry={() => {
              void products.refetch()
            }}
          />
        ) : null}

        {products.isError && page ? (
          <p
            role="alert"
            className="border-b border-border px-4 py-2 text-sm text-destructive"
          >
            The latest product list could not be refreshed.
          </p>
        ) : null}

        {page && isEmpty ? <ProductEmptyState filtered={filtered} /> : null}

        {page && !isEmpty ? (
          <ProductTable
            products={page.items}
            isRefreshing={products.isFetching && !products.isPending}
          />
        ) : null}

        {page && page.pagination.total > 0 ? (
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
                disabled={query.page <= 1 || products.isFetching}
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
                  products.isFetching
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
    </section>
  )
}
