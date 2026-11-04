import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"

import {
  useDiscountListParams,
  useProductListParams,
  useVendorProducts,
} from "../hooks"
import { formatResultRange } from "../lib/format"
import { hasProductFilters } from "../lib/product-query"
import type {
  Product,
  ProductApprovalStatus,
  ProductListPatch,
  ProductListQuery,
  ProductSort,
  ProductStatus,
} from "../types"

import {
  ProductEmptyState,
  ProductErrorState,
  ProductTableSkeleton,
} from "./product-states"
import { ProductDeleteDialog } from "./product-delete-dialog"
import { ProductDetailsDialog } from "./product-details-dialog"
import { ProductTable } from "./product-table"
import { ProductToolbar } from "./product-toolbar"

type CatalogVariant = "catalog" | "discounted"

type ProductCatalogViewProps = {
  variant: CatalogVariant
  query: ProductListQuery
  updateQuery: (patch: ProductListPatch) => void
  clearFilters: () => void
}

function ProductCatalogView({
  variant,
  query,
  updateQuery,
  clearFilters,
}: ProductCatalogViewProps) {
  const navigate = useNavigate()
  const [viewing, setViewing] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState<Product | null>(null)
  const products = useVendorProducts(query)
  const page = products.data
  const isDiscounted = variant === "discounted"

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
      className="flex w-full flex-col gap-4"
      aria-busy={products.isFetching}
    >
      <ProductToolbar
        query={query}
        total={page?.pagination.total}
        variant={variant}
        onSearch={changeSearch}
        onStatus={changeStatus}
        onApprovalStatus={changeApproval}
        onPublished={changePublished}
        onSort={changeSort}
        onClear={clearFilters}
        onCreate={
          isDiscounted ? undefined : () => navigate("/store/products/new")
        }
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

        {page && isEmpty ? (
          <ProductEmptyState filtered={filtered} variant={variant} />
        ) : null}

        {page && !isEmpty ? (
          <ProductTable
            products={page.items}
            isRefreshing={products.isFetching && !products.isPending}
            caption={
              isDiscounted ? "Discounted store products" : "Store products"
            }
            onView={setViewing}
            onEdit={(product) => navigate(`/store/products/${product.id}/edit`)}
            onDelete={setDeleting}
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

      <ProductDetailsDialog
        product={viewing}
        onClose={() => setViewing(null)}
      />
      <ProductDeleteDialog
        product={deleting}
        onClose={() => setDeleting(null)}
      />
    </section>
  )
}

export function ProductCatalog() {
  const params = useProductListParams()

  return <ProductCatalogView variant="catalog" {...params} />
}

export function DiscountProductCatalog() {
  const params = useDiscountListParams()

  return <ProductCatalogView variant="discounted" {...params} />
}
