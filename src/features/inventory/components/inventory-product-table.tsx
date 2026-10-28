import { useMemo, useState } from "react"
import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from "@tanstack/react-table"
import { Ellipsis, Eye, Package, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { resolveAssetUrl } from "@/lib/api/assets"
import { cn } from "@/lib/utils"

import { PRODUCT_APPROVAL_LABEL, PRODUCT_STATUS_LABEL } from "../constants"
import {
  formatCount,
  formatInventoryDate,
  formatPriceRange,
  formatUnits,
} from "../lib/format"
import type { InventoryProduct } from "../types"

import { StockLevelBadge } from "./stock-level-badge"

const features = tableFeatures({})
const columnHelper = createColumnHelper<typeof features, InventoryProduct>()

const columns = columnHelper.columns([
  columnHelper.accessor("name", {
    id: "product",
    header: "Product",
    cell: ({ row }) => <ProductIdentity product={row.original} />,
  }),
  columnHelper.accessor((product) => product.category.name, {
    id: "category",
    header: "Category",
    cell: ({ getValue }) => getValue() || "—",
  }),
  columnHelper.display({
    id: "price",
    header: "Price",
    cell: ({ row }) =>
      formatPriceRange(row.original.minPrice, row.original.maxPrice),
  }),
  columnHelper.display({
    id: "stock",
    header: "Stock",
    cell: ({ row }) => <StockCell product={row.original} />,
  }),
  columnHelper.accessor("stockLevel", {
    id: "level",
    header: "Level",
    cell: ({ getValue }) => <StockLevelBadge level={getValue()} />,
  }),
  columnHelper.display({
    id: "variants",
    header: "Variants",
    cell: ({ row }) => <VariantCell product={row.original} />,
  }),
  columnHelper.display({
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <div>
        <p>{PRODUCT_STATUS_LABEL[row.original.status]}</p>
        <p className="text-xs text-muted-foreground">
          {PRODUCT_APPROVAL_LABEL[row.original.approvalStatus]}
        </p>
      </div>
    ),
  }),
  columnHelper.accessor("updatedAt", {
    header: "Updated",
    cell: ({ getValue }) => formatInventoryDate(getValue()),
  }),
])

const CELL_CLASS: Record<string, string> = {
  product: "min-w-56",
  category: "text-muted-foreground",
  price: "whitespace-nowrap",
  stock: "whitespace-nowrap",
  variants: "whitespace-nowrap text-muted-foreground",
  updatedAt: "whitespace-nowrap text-muted-foreground",
  actions: "w-12 text-end",
}

type InventoryProductTableProps = {
  products: InventoryProduct[]
  isRefreshing: boolean
  onOpen: (productId: string) => void
  onEdit: (productId: string) => void
}

export function InventoryProductTable({
  products,
  isRefreshing,
  onOpen,
  onEdit,
}: InventoryProductTableProps) {
  const columnsWithActions = useMemo(
    () => [
      ...columns,
      columnHelper.display({
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <ProductRowActions
            product={row.original}
            onOpen={onOpen}
            onEdit={onEdit}
          />
        ),
      }),
    ],
    [onEdit, onOpen]
  )
  const table = useTable({
    features,
    columns: columnsWithActions,
    data: products,
    getRowId: (product) => product.id,
  })

  return (
    <div
      className={cn(
        "transition-opacity",
        isRefreshing && "pointer-events-none opacity-70"
      )}
    >
      <Table>
        <TableCaption className="sr-only">Product inventory</TableCaption>
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
              onClick={() => onOpen(row.original.id)}
              onKeyDown={(event) => {
                if (event.target !== event.currentTarget) {
                  return
                }

                if (event.key === "Enter") {
                  onOpen(row.original.id)
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

function ProductRowActions({
  product,
  onOpen,
  onEdit,
}: {
  product: InventoryProduct
  onOpen: (productId: string) => void
  onEdit: (productId: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="cursor-pointer"
          aria-label={`Actions for ${product.name}`}
        >
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        onClick={(event) => event.stopPropagation()}
      >
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={() => onOpen(product.id)}
        >
          <Eye />
          Stock
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={() => onEdit(product.id)}
        >
          <Pencil />
          Edit product
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ProductIdentity({ product }: { product: InventoryProduct }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <ProductThumb product={product} />
      <div className="min-w-0">
        <p className="truncate font-medium">{product.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {product.defaultSku || product.slug}
        </p>
      </div>
    </div>
  )
}

function ProductThumb({ product }: { product: InventoryProduct }) {
  const [failed, setFailed] = useState(false)
  const url = product.thumbnail?.url

  if (!url || failed) {
    return (
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Package className="size-4" />
      </span>
    )
  }

  return (
    <img
      src={resolveAssetUrl(url)}
      alt=""
      className="size-10 shrink-0 rounded-lg object-cover"
      onError={() => setFailed(true)}
    />
  )
}

function StockCell({ product }: { product: InventoryProduct }) {
  return (
    <div>
      <p>{formatUnits(product.totalStock)}</p>
      <p className="text-xs text-muted-foreground">
        {formatUnits(product.sellableStock)} sellable
      </p>
    </div>
  )
}

function VariantCell({ product }: { product: InventoryProduct }) {
  return (
    <div>
      <p>
        {formatCount(product.activeVariantCount)} /{" "}
        {formatCount(product.variantCount)} active
      </p>
      <p className="text-xs">
        {formatCount(product.lowStockVariantCount)} low ·{" "}
        {formatCount(product.outOfStockVariantCount)} out
      </p>
    </div>
  )
}
