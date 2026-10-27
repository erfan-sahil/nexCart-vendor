import { useEffect, useState } from "react"
import { ChevronDown, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

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

const ALL = "all"

type FilterOption = {
  value: string
  label: string
}

const STATUS_OPTIONS: FilterOption[] = [
  { value: ALL, label: "All statuses" },
  ...PRODUCT_STATUSES.map((status) => ({
    value: status,
    label: PRODUCT_STATUS_LABEL[status],
  })),
]

const APPROVAL_OPTIONS: FilterOption[] = [
  { value: ALL, label: "All approvals" },
  ...PRODUCT_APPROVAL_STATUSES.map((status) => ({
    value: status,
    label: PRODUCT_APPROVAL_LABEL[status],
  })),
]

const VISIBILITY_OPTIONS: FilterOption[] = [
  { value: ALL, label: "All visibility" },
  { value: "true", label: "Published" },
  { value: "false", label: "Unpublished" },
]

const SORT_OPTIONS: FilterOption[] = PRODUCT_SORTS.map((sort) => ({
  value: sort,
  label: PRODUCT_SORT_LABEL[sort],
}))

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

function optionLabel(options: FilterOption[], value: string) {
  return options.find((option) => option.value === value)?.label ?? "All"
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

  const publishedValue =
    query.isPublished === undefined ? ALL : String(query.isPublished)

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
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

      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <InputGroup className="lg:max-w-sm lg:flex-1">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            value={search}
            placeholder="Search products"
            aria-label="Search products"
            onChange={(event) => setDraft(event.target.value)}
          />
          {search ? (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-xs"
                aria-label="Clear search"
                onClick={() => {
                  setDraft("")
                  onSearch(undefined)
                }}
              >
                <X />
              </InputGroupButton>
            </InputGroupAddon>
          ) : null}
        </InputGroup>

        <div className="flex flex-wrap gap-2">
          <FilterMenu
            label="Status"
            value={query.status ?? ALL}
            options={STATUS_OPTIONS}
            onChange={(value) => onStatus(isStatus(value) ? value : undefined)}
          />
          <FilterMenu
            label="Approval"
            value={query.approvalStatus ?? ALL}
            options={APPROVAL_OPTIONS}
            onChange={(value) =>
              onApprovalStatus(isApprovalStatus(value) ? value : undefined)
            }
          />
          <FilterMenu
            label="Visibility"
            value={publishedValue}
            options={VISIBILITY_OPTIONS}
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
          />
          <FilterMenu
            label="Sort"
            value={query.sort}
            options={SORT_OPTIONS}
            onChange={(value) => {
              if (isSort(value)) {
                onSort(value)
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}

function FilterMenu({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: FilterOption[]
  onChange: (value: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline">
          <span className="text-muted-foreground">{label}</span>
          {optionLabel(options, value)}
          <ChevronDown className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
