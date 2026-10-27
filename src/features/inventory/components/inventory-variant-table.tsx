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
  formatInventoryDate,
  formatMoney,
  formatOptionLabel,
  formatUnits,
  hasDiscount,
} from "../lib/format"
import type { InventoryVariant } from "../types"

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
    cell: ({ getValue }) => getValue() || "—",
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
  columnHelper.accessor("updatedAt", {
    header: "Updated",
    cell: ({ getValue }) => formatInventoryDate(getValue()),
  }),
])

const CELL_CLASS: Record<string, string> = {
  variant: "min-w-48",
  product: "min-w-40",
  price: "whitespace-nowrap",
  stock: "whitespace-nowrap",
  updatedAt: "whitespace-nowrap text-muted-foreground",
}

type InventoryVariantTableProps = {
  variants: InventoryVariant[]
  isRefreshing: boolean
  onOpen: (productId: string) => void
}

export function InventoryVariantTable({
  variants,
  isRefreshing,
  onOpen,
}: InventoryVariantTableProps) {
  const table = useTable({
    features,
    columns,
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
      <Table>
        <TableCaption className="sr-only">Variant inventory</TableCaption>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
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
                <TableCell key={cell.id} className={CELL_CLASS[cell.column.id]}>
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
