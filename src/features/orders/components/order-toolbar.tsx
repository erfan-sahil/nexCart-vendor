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
  VENDOR_ORDER_SORT_LABEL,
  VENDOR_ORDER_SORTS,
  VENDOR_ORDER_STATUS_LABEL,
  type OrderStatusScope,
  statusesForScope,
} from "../constants"
import { hasOrderFilters } from "../lib/order-query"
import type {
  OrderListQuery,
  VendorOrderSort,
  VendorOrderStatus,
} from "../types"

const ALL = "all"

type FilterOption = {
  value: string
  label: string
}

const SORT_OPTIONS: FilterOption[] = VENDOR_ORDER_SORTS.map((sort) => ({
  value: sort,
  label: VENDOR_ORDER_SORT_LABEL[sort],
}))

type OrderToolbarProps = {
  scope: OrderStatusScope
  query: OrderListQuery
  total: number | undefined
  onSearch: (search: string | undefined) => void
  onStatus: (status: VendorOrderStatus | undefined) => void
  onSort: (sort: VendorOrderSort) => void
  onClear: () => void
}

function isStatus(value: string): value is VendorOrderStatus {
  return value in VENDOR_ORDER_STATUS_LABEL
}

function isSort(value: string): value is VendorOrderSort {
  return (VENDOR_ORDER_SORTS as readonly string[]).includes(value)
}

function optionLabel(options: FilterOption[], value: string) {
  return options.find((option) => option.value === value)?.label ?? "All"
}

export function OrderToolbar({
  scope,
  query,
  total,
  onSearch,
  onStatus,
  onSort,
  onClear,
}: OrderToolbarProps) {
  const querySearch = query.search ?? ""
  const [draft, setDraft] = useState<string | null>(null)
  const [trackedSearch, setTrackedSearch] = useState(querySearch)
  const search = draft ?? querySearch
  const filtersActive =
    hasOrderFilters(query) ||
    (draft !== null && draft.trim() !== querySearch && draft.trim().length > 0)

  const statusOptions: FilterOption[] = [
    { value: ALL, label: "All statuses" },
    ...statusesForScope(scope).map((status) => ({
      value: status,
      label: VENDOR_ORDER_STATUS_LABEL[status],
    })),
  ]

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
        <p className="text-sm text-muted-foreground">
          {total === undefined
            ? "Vendor orders"
            : `${total} ${total === 1 ? "order" : "orders"}`}
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
            placeholder="Search orders"
            aria-label="Search orders"
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
            options={statusOptions}
            onChange={(value) => onStatus(isStatus(value) ? value : undefined)}
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
