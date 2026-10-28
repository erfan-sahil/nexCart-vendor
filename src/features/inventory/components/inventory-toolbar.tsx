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
  PRODUCT_SORT_LABEL,
  VARIANT_SORT_LABEL,
} from "../constants"
import { hasInventoryFilters } from "../lib/inventory-query"
import type {
  InventoryListParams,
  InventoryProductSort,
  InventoryVariantSort,
  InventoryView,
} from "../types"

type FilterOption = {
  value: string
  label: string
}

type InventoryToolbarProps = {
  query: InventoryListParams
  total: number | undefined
  onSearch: (search: string | undefined) => void
  onView: (view: InventoryView) => void
  onSort: (sort: InventoryProductSort | InventoryVariantSort) => void
  onClear: () => void
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
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex w-fit rounded-lg border border-border p-0.5">
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
        <InputGroup className="sm:max-w-sm sm:flex-1">
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
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm text-muted-foreground">
          {total === undefined
            ? "Store inventory"
            : `${total} ${total === 1 ? noun : `${noun}s`}`}
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline">
              <span className="text-muted-foreground">Sort</span>
              {optionLabel(sortOptions, query.sort)}
              <ChevronDown className="text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Sort</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={query.sort}
              onValueChange={(value) => {
                if (query.view === "products" && isProductSort(value)) {
                  onSort(value)
                }

                if (query.view === "variants" && isVariantSort(value)) {
                  onSort(value)
                }
              }}
            >
              {sortOptions.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
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
            Clear
          </Button>
        ) : null}
      </div>
    </div>
  )
}
