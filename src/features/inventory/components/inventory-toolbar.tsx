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
  INVENTORY_PRODUCT_SORTS,
  INVENTORY_VARIANT_SORTS,
  LOW_STOCK_PRESETS,
  PRODUCT_APPROVAL_LABEL,
  PRODUCT_APPROVAL_STATUSES,
  PRODUCT_SORT_LABEL,
  PRODUCT_STATUS_LABEL,
  PRODUCT_STATUSES,
  STOCK_LEVEL_LABEL,
  STOCK_LEVELS,
  VARIANT_SORT_LABEL,
} from "../constants"
import { hasInventoryFilters } from "../lib/inventory-query"
import type {
  CatalogStatus,
  InventoryListParams,
  InventoryProductSort,
  InventoryVariantSort,
  InventoryView,
  ProductApprovalStatus,
  StockLevel,
} from "../types"

const ALL = "all"

type FilterOption = {
  value: string
  label: string
}

const STOCK_OPTIONS: FilterOption[] = [
  { value: ALL, label: "All levels" },
  ...STOCK_LEVELS.map((level) => ({
    value: level,
    label: STOCK_LEVEL_LABEL[level],
  })),
]

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

type InventoryToolbarProps = {
  query: InventoryListParams
  total: number | undefined
  onSearch: (search: string | undefined) => void
  onView: (view: InventoryView) => void
  onStockLevel: (stockLevel: StockLevel | undefined) => void
  onStatus: (status: CatalogStatus | undefined) => void
  onApprovalStatus: (status: ProductApprovalStatus | undefined) => void
  onLowStockAt: (lowStockAt: number) => void
  onSort: (sort: InventoryProductSort | InventoryVariantSort) => void
  onClear: () => void
}

function isStockLevel(value: string): value is StockLevel {
  return (STOCK_LEVELS as readonly string[]).includes(value)
}

function isStatus(value: string): value is CatalogStatus {
  return (PRODUCT_STATUSES as readonly string[]).includes(value)
}

function isApprovalStatus(value: string): value is ProductApprovalStatus {
  return (PRODUCT_APPROVAL_STATUSES as readonly string[]).includes(value)
}

function isProductSort(value: string): value is InventoryProductSort {
  return (INVENTORY_PRODUCT_SORTS as readonly string[]).includes(value)
}

function isVariantSort(value: string): value is InventoryVariantSort {
  return (INVENTORY_VARIANT_SORTS as readonly string[]).includes(value)
}

function optionLabel(options: FilterOption[], value: string) {
  return options.find((option) => option.value === value)?.label ?? "All"
}

export function InventoryToolbar({
  query,
  total,
  onSearch,
  onView,
  onStockLevel,
  onStatus,
  onApprovalStatus,
  onLowStockAt,
  onSort,
  onClear,
}: InventoryToolbarProps) {
  const querySearch = query.search ?? ""
  const [draft, setDraft] = useState<string | null>(null)
  const [trackedSearch, setTrackedSearch] = useState(querySearch)
  const search = draft ?? querySearch
  const noun = query.view === "products" ? "product" : "variant"
  const filtersActive =
    hasInventoryFilters(query) ||
    (draft !== null && draft.trim() !== querySearch && draft.trim().length > 0)
  const sortOptions: FilterOption[] =
    query.view === "products"
      ? INVENTORY_PRODUCT_SORTS.map((sort) => ({
          value: sort,
          label: PRODUCT_SORT_LABEL[sort],
        }))
      : INVENTORY_VARIANT_SORTS.map((sort) => ({
          value: sort,
          label: VARIANT_SORT_LABEL[sort],
        }))
  const thresholds = LOW_STOCK_PRESETS.includes(
    query.lowStockAt as (typeof LOW_STOCK_PRESETS)[number]
  )
    ? LOW_STOCK_PRESETS
    : [...LOW_STOCK_PRESETS, query.lowStockAt].sort(
        (left, right) => left - right
      )
  const thresholdOptions: FilterOption[] = thresholds.map((value) => ({
    value: String(value),
    label: `${value} units`,
  }))

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg border border-border p-0.5">
            <Button
              type="button"
              size="sm"
              variant={query.view === "products" ? "secondary" : "ghost"}
              aria-pressed={query.view === "products"}
              onClick={() => onView("products")}
            >
              Products
            </Button>
            <Button
              type="button"
              size="sm"
              variant={query.view === "variants" ? "secondary" : "ghost"}
              aria-pressed={query.view === "variants"}
              onClick={() => onView("variants")}
            >
              Variants
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {total === undefined
              ? "Store inventory"
              : `${total} ${total === 1 ? noun : `${noun}s`}`}
          </p>
        </div>
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
            placeholder={
              query.view === "products"
                ? "Search products or SKU"
                : "Search variants or products"
            }
            aria-label="Search inventory"
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
            label="Stock"
            value={query.stockLevel ?? ALL}
            options={STOCK_OPTIONS}
            onChange={(value) =>
              onStockLevel(isStockLevel(value) ? value : undefined)
            }
          />
          <FilterMenu
            label="Status"
            value={query.status ?? ALL}
            options={STATUS_OPTIONS}
            onChange={(value) => onStatus(isStatus(value) ? value : undefined)}
          />
          {query.view === "products" ? (
            <FilterMenu
              label="Approval"
              value={query.approvalStatus ?? ALL}
              options={APPROVAL_OPTIONS}
              onChange={(value) =>
                onApprovalStatus(isApprovalStatus(value) ? value : undefined)
              }
            />
          ) : null}
          <FilterMenu
            label="Low at"
            value={String(query.lowStockAt)}
            options={thresholdOptions}
            onChange={(value) => {
              const next = Number(value)

              if (Number.isInteger(next) && next > 0) {
                onLowStockAt(next)
              }
            }}
          />
          <FilterMenu
            label="Sort"
            value={query.sort}
            options={sortOptions}
            onChange={(value) => {
              if (query.view === "products" && isProductSort(value)) {
                onSort(value)
              }

              if (query.view === "variants" && isVariantSort(value)) {
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
