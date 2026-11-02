import { useMemo } from "react"
import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from "@tanstack/react-table"
import { Ellipsis, Eye } from "lucide-react"

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
import { cn } from "@/lib/utils"

import { formatItemCount, formatMoney, formatOrderDate } from "../lib/format"
import type { VendorOrder } from "../types"

import { OrderStatusBadge } from "./order-status-badge"

const features = tableFeatures({})
const columnHelper = createColumnHelper<typeof features, VendorOrder>()

const columns = columnHelper.columns([
  columnHelper.accessor("vendorOrderNumber", {
    id: "order",
    header: "Order",
    cell: ({ row }) => <OrderIdentity order={row.original} />,
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => <OrderStatusBadge status={getValue()} />,
  }),
  columnHelper.display({
    id: "items",
    header: "Items",
    cell: ({ row }) => formatItemCount(row.original.items.length),
  }),
  columnHelper.accessor("itemsSubtotal", {
    id: "subtotal",
    header: "Subtotal",
    cell: ({ getValue }) => formatMoney(getValue()),
  }),
  columnHelper.accessor("updatedAt", {
    header: "Updated",
    cell: ({ getValue }) => formatOrderDate(getValue()),
  }),
])

type OrderTableProps = {
  orders: VendorOrder[]
  isRefreshing: boolean
  onView: (order: VendorOrder) => void
}

const CELL_CLASS: Record<string, string> = {
  order: "min-w-52",
  items: "whitespace-nowrap text-muted-foreground",
  subtotal: "whitespace-nowrap",
  updatedAt: "whitespace-nowrap text-muted-foreground",
  actions: "w-12 text-end",
}

export function OrderTable({ orders, isRefreshing, onView }: OrderTableProps) {
  const columnsWithActions = useMemo(
    () => [
      ...columns,
      columnHelper.display({
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <OrderRowActions order={row.original} onView={onView} />
        ),
      }),
    ],
    [onView]
  )

  const table = useTable({
    features,
    columns: columnsWithActions,
    data: orders,
    getRowId: (order) => order.id,
  })

  return (
    <div
      className={cn(
        "transition-opacity",
        isRefreshing && "pointer-events-none opacity-70"
      )}
    >
      <Table>
        <TableCaption className="sr-only">Vendor orders</TableCaption>
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

function OrderRowActions({
  order,
  onView,
}: {
  order: VendorOrder
  onView: (order: VendorOrder) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="cursor-pointer"
          aria-label={`Actions for ${order.vendorOrderNumber}`}
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
          onSelect={() => onView(order)}
        >
          <Eye />
          Details
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function OrderIdentity({ order }: { order: VendorOrder }) {
  return (
    <div className="min-w-0">
      <p className="truncate font-medium">{order.vendorOrderNumber}</p>
      <p className="truncate text-xs text-muted-foreground">
        Parent {order.orderNumber}
      </p>
    </div>
  )
}
