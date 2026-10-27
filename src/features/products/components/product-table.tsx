import { useMemo, useState } from "react"
import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from "@tanstack/react-table"
import { Ellipsis, Eye, Package, Pencil, Trash2 } from "lucide-react"

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
  formatPriceRange,
  formatProductDate,
  formatVariantCount,
} from "../lib/format"
import type { Product } from "../types"

const features = tableFeatures({})
const columnHelper = createColumnHelper<typeof features, Product>()

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
    cell: ({ row }) => formatPriceRange(row.original.offer),
  }),
  columnHelper.display({
    id: "stock",
    header: "Stock",
    cell: ({ row }) => <StockCell product={row.original} />,
  }),
  columnHelper.display({
    id: "status",
    header: "Status",
    cell: ({ row }) => <StatusCell product={row.original} />,
  }),
  columnHelper.accessor("updatedAt", {
    header: "Updated",
    cell: ({ getValue }) => formatProductDate(getValue()),
  }),
])

type ProductTableProps = {
  products: Product[]
  isRefreshing: boolean
  onView: (product: Product) => void
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

const CELL_CLASS: Record<string, string> = {
  product: "min-w-56",
  category: "text-muted-foreground",
  price: "whitespace-nowrap",
  updatedAt: "whitespace-nowrap text-muted-foreground",
  actions: "w-12 text-end",
}

export function ProductTable({
  products,
  isRefreshing,
  onView,
  onEdit,
  onDelete,
}: ProductTableProps) {
  const columnsWithActions = useMemo(
    () => [
      ...columns,
      columnHelper.display({
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <ProductRowActions
            product={row.original}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ),
      }),
    ],
    [onDelete, onEdit, onView]
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
        <TableCaption className="sr-only">Store products</TableCaption>
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
              onClick={() => onView(row.original)}
              onKeyDown={(event) => {
                if (event.target !== event.currentTarget) {
                  return
                }

                if (event.key === "Enter") {
                  onView(row.original)
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
  onView,
  onEdit,
  onDelete,
}: {
  product: Product
  onView: (product: Product) => void
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}) {
  const locked = product.approvalStatus === "submitted"

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
          onSelect={() => onView(product)}
        >
          <Eye />
          Details
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          disabled={locked}
          title={
            locked ? "This product is waiting for admin approval." : undefined
          }
          onSelect={() => onEdit(product)}
        >
          <Pencil />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          variant="destructive"
          onSelect={() => onDelete(product)}
        >
          <Trash2 />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ProductIdentity({ product }: { product: Product }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <ProductThumb product={product} />
      <div className="min-w-0">
        <p className="truncate font-medium">{product.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {product.shortDescription || product.slug}
          {product.isFeatured ? " · Featured" : ""}
        </p>
      </div>
    </div>
  )
}

function ProductThumb({ product }: { product: Product }) {
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

function StockCell({ product }: { product: Product }) {
  if (product.offer.variantCount === 0) {
    return <span className="text-muted-foreground">No variants</span>
  }

  return (
    <div>
      <p>{product.offer.inStock ? "In stock" : "Out of stock"}</p>
      <p className="text-xs text-muted-foreground">
        {formatVariantCount(product.offer.variantCount)}
      </p>
    </div>
  )
}

function StatusCell({ product }: { product: Product }) {
  return (
    <div>
      <p>{PRODUCT_STATUS_LABEL[product.status]}</p>
      <p className="text-xs text-muted-foreground">
        {PRODUCT_APPROVAL_LABEL[product.approvalStatus]}
        {" · "}
        {product.isPublished ? "Published" : "Unpublished"}
      </p>
    </div>
  )
}
