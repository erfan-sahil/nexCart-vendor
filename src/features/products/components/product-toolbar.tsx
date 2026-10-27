import { useEffect, useId, useState, type ReactNode } from "react"
import { Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

import {
  PRODUCT_APPROVAL_LABEL,
  PRODUCT_APPROVAL_STATUSES,
  PRODUCT_SORT_LABEL,
  PRODUCT_SORTS,
  PRODUCT_STATUS_LABEL,
  PRODUCT_STATUSES,
} from "../constants"
import { hasProductFilters } from "../lib/product-query"
import type {
  ProductApprovalStatus,
  ProductListQuery,
  ProductSort,
  ProductStatus,
} from "../types"

const controlClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"

type ProductToolbarProps = {
  query: ProductListQuery
  total: number | undefined
  onSearch: (search: string | undefined) => void
  onStatus: (status: ProductStatus | undefined) => void
  onApprovalStatus: (status: ProductApprovalStatus | undefined) => void
  onPublished: (isPublished: boolean | undefined) => void
  onSort: (sort: ProductSort) => void
  onClear: () => void
}

function isStatus(value: string): value is ProductStatus {
  return (PRODUCT_STATUSES as readonly string[]).includes(value)
}

function isApprovalStatus(value: string): value is ProductApprovalStatus {
  return (PRODUCT_APPROVAL_STATUSES as readonly string[]).includes(value)
}

function isSort(value: string): value is ProductSort {
  return (PRODUCT_SORTS as readonly string[]).includes(value)
}

export function ProductToolbar({
  query,
  total,
  onSearch,
  onStatus,
  onApprovalStatus,
  onPublished,
  onSort,
  onClear,
}: ProductToolbarProps) {
  const searchId = useId()
  const statusId = useId()
  const approvalId = useId()
  const publishedId = useId()
  const sortId = useId()
  const querySearch = query.search ?? ""
  const [draft, setDraft] = useState<string | null>(null)
  const [trackedSearch, setTrackedSearch] = useState(querySearch)
  const search = draft ?? querySearch
  const filtersActive =
    hasProductFilters(query) ||
    (draft !== null && draft.trim() !== querySearch && draft.trim().length > 0)

  if (querySearch !== trackedSearch) {
    setTrackedSearch(querySearch)

    if (draft === null || draft.trim() === querySearch) {
      setDraft(null)
    }
  }

  useEffect(() => {
    const trimmed = search.trim()

    if (trimmed === querySearch) {
      return undefined
    }

    const timeout = window.setTimeout(() => {
      onSearch(trimmed || undefined)
    }, 300)

    return () => window.clearTimeout(timeout)
  }, [onSearch, querySearch, search])

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {total === undefined
            ? "Store products"
            : `${total} ${total === 1 ? "product" : "products"}`}
        </p>
        {filtersActive ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setDraft("")
              onClear()
            }}
          >
            <X />
            Clear filters
          </Button>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <div className="flex flex-col gap-1.5 sm:col-span-2 xl:col-span-1">
          <Label htmlFor={searchId} className="text-xs text-muted-foreground">
            Search
          </Label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id={searchId}
              value={search}
              placeholder="Name or description"
              className="pl-8"
              onChange={(event) => setDraft(event.target.value)}
            />
          </div>
        </div>

        <FilterSelect
          id={statusId}
          label="Status"
          value={query.status ?? ""}
          onChange={(value) => onStatus(isStatus(value) ? value : undefined)}
        >
          <option value="">All statuses</option>
          {PRODUCT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {PRODUCT_STATUS_LABEL[status]}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          id={approvalId}
          label="Approval"
          value={query.approvalStatus ?? ""}
          onChange={(value) =>
            onApprovalStatus(isApprovalStatus(value) ? value : undefined)
          }
        >
          <option value="">All approvals</option>
          {PRODUCT_APPROVAL_STATUSES.map((status) => (
            <option key={status} value={status}>
              {PRODUCT_APPROVAL_LABEL[status]}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          id={publishedId}
          label="Visibility"
          value={
            query.isPublished === undefined ? "" : String(query.isPublished)
          }
          onChange={(value) => {
            if (value === "true") {
              onPublished(true)
              return
            }

            if (value === "false") {
              onPublished(false)
              return
            }

            onPublished(undefined)
          }}
        >
          <option value="">All visibility</option>
          <option value="true">Published</option>
          <option value="false">Unpublished</option>
        </FilterSelect>

        <FilterSelect
          id={sortId}
          label="Sort"
          value={query.sort}
          onChange={(value) => {
            if (isSort(value)) {
              onSort(value)
            }
          }}
        >
          {PRODUCT_SORTS.map((sort) => (
            <option key={sort} value={sort}>
              {PRODUCT_SORT_LABEL[sort]}
            </option>
          ))}
        </FilterSelect>
      </div>
    </div>
  )
}

type FilterSelectProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  children: ReactNode
}

function FilterSelect({
  id,
  label,
  value,
  onChange,
  children,
}: FilterSelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <select
        id={id}
        value={value}
        className={cn(controlClass)}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
    </div>
  )
}
