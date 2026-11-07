import { useMemo } from "react"
import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

import { PRODUCT_STATUS_LABEL } from "../constants"
import {
  formatMoney,
  formatOptionLabel,
  formatUnits,
  hasDiscount,
} from "../lib/format"
import type { InventoryVariant } from "../types"

import { InventoryVariantActions } from "./inventory-variant-actions"
import { StockLevelBadge } from "./stock-level-badge"

const features = tableFeatures({})
const columnHelper = createColumnHelper<typeof features, InventoryVariant>()

const columns = columnHelper.columns([
  columnHelper.accessor("sku", {
    id: "variant",
    header: "Variant",
    cell: ({ row }) => <VariantIdentity variant={row.original} />,
  }),
  columnHelper.accessor((variant) => variant.product.name, {
    id: "product",
    header: "Product",
    cell: ({ getValue }) => <p className="truncate">{getValue() || "—"}</p>,
  }),
  columnHelper.display({
    id: "price",
    header: "Price",
    cell: ({ row }) => <PriceCell variant={row.original} />,
  }),
  columnHelper.accessor("stock", {
    header: "Stock",
    cell: ({ getValue }) => formatUnits(getValue()),
  }),
  columnHelper.accessor("stockLevel", {
    id: "level",
    header: "Level",
    cell: ({ getValue }) => <StockLevelBadge level={getValue()} />,
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ row }) => (
      <div>
        <p>{PRODUCT_STATUS_LABEL[row.original.status]}</p>
        {row.original.isDefault ? (
          <p className="text-xs text-muted-foreground">Default</p>
        ) : null}
      </div>
    ),
  }),
])

const CELL_CLASS: Record<string, string> = {
  variant: "w-44 max-w-44 overflow-hidden",
  product: "w-44 max-w-44 overflow-hidden",
  price: "whitespace-nowrap",
  stock: "whitespace-nowrap",
  actions: "w-12 text-end",
}

type InventoryVariantTableProps = {
  variants: InventoryVariant[]
  isRefreshing: boolean
  onOpen: (productId: string) => void
  onDetails: (variant: InventoryVariant) => void
  onUpdate: (variant: InventoryVariant) => void
}

export function InventoryVariantTable({
  variants,
  isRefreshing,
  onOpen,
  onDetails,
  onUpdate,
}: InventoryVariantTableProps) {
  const columnsWithActions = useMemo(
    () => [
      ...columns,
      columnHelper.display({
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <InventoryVariantActions
            variant={row.original}
            onDetails={onDetails}
            onUpdate={onUpdate}
          />
        ),
      }),
    ],
    [onDetails, onUpdate]
  )
  const table = useTable({
    features,
    columns: columnsWithActions,
    data: variants,
    getRowId: (variant) => variant.id,
  })

  return (
    <div
      className={cn(
        "transition-opacity",
        isRefreshing && "pointer-events-none opacity-70"
      )}
    >
      <Table className="table-fixed">
        <TableCaption className="sr-only">Variant inventory</TableCaption>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={CELL_CLASS[header.column.id]}
                >
                  {header.isPlaceholder ? null : (
                    <table.FlexRender header={header} />
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className="cursor-pointer"
              tabIndex={0}
              onClick={() => onOpen(row.original.product.id)}
              onKeyDown={(event) => {
                if (event.target !== event.currentTarget) {
                  return
                }

                if (event.key === "Enter") {
                  onOpen(row.original.product.id)
                }
              }}
            >
              {row.getAllCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={CELL_CLASS[cell.column.id]}
                  onClick={
                    cell.column.id === "actions"
                      ? (event) => event.stopPropagation()
                      : undefined
                  }
                >
                  <table.FlexRender cell={cell} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function VariantIdentity({ variant }: { variant: InventoryVariant }) {
  return (
    <div className="min-w-0">
      <p className="truncate font-medium">{variant.sku}</p>
      <p className="truncate text-xs text-muted-foreground">
        {formatOptionLabel(variant.options)}
      </p>
    </div>
  )
}

function PriceCell({ variant }: { variant: InventoryVariant }) {
  const discounted = hasDiscount(variant.price, variant.currentPrice)

  return (
    <div>
      <p>{formatMoney(variant.currentPrice)}</p>
      {discounted ? (
        <p className="text-xs text-muted-foreground line-through">
          {formatMoney(variant.price)}
        </p>
      ) : null}
    </div>
  )
}
