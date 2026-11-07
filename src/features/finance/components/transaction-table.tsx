import { useMemo } from "react"
import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from "@tanstack/react-table"
import {
  Clock,
  Ellipsis,
  Eye,
  Lock,
  Wallet,
  type LucideIcon,
} from "lucide-react"

import { CustomBadge, type BadgeColor } from "@/components/shared"
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

import { TransactionDirectionIcon } from "./transaction-details-dialog"
import {
  isLedgerCredit,
  ledgerAccountLabel,
  ledgerTypeLabel,
} from "../constants"
import {
  formatFinanceDateTime,
  formatSignedBdt,
  shortenId,
} from "../lib/format"
import type { LedgerRow } from "../services/vendor-finance.api"

const features = tableFeatures({})
const columnHelper = createColumnHelper<typeof features, LedgerRow>()

const columns = columnHelper.columns([
  columnHelper.display({
    id: "transaction",
    header: "Transaction",
    cell: ({ row }) => <TransactionIdentity row={row.original} />,
  }),
  columnHelper.accessor("account", {
    header: "Account",
    cell: ({ getValue }) => <AccountBadge account={getValue()} />,
  }),
  columnHelper.accessor("vendorOrderId", {
    header: "Order",
    cell: ({ getValue }) => {
      const id = getValue()

      if (!id) {
        return <span className="text-muted-foreground">—</span>
      }

      return (
        <span className="font-mono text-xs text-muted-foreground" title={id}>
          {shortenId(id)}
        </span>
      )
    },
  }),
  columnHelper.display({
    id: "amount",
    header: () => <span className="block w-full text-right">Amount</span>,
    cell: ({ row }) => {
      const credit = isLedgerCredit(row.original.type, row.original.account)

      return (
        <span
          className={cn(
            "block text-right font-medium tabular-nums",
            credit
              ? "text-emerald-700 dark:text-emerald-300"
              : "text-amber-900 dark:text-amber-100"
          )}
        >
          {formatSignedBdt(row.original.amount, credit)}
        </span>
      )
    },
  }),
  columnHelper.accessor("createdAt", {
    header: () => <span className="hidden lg:table-cell">Date</span>,
    cell: ({ getValue }) => (
      <span className="hidden text-sm text-muted-foreground lg:inline">
        {formatFinanceDateTime(getValue())}
      </span>
    ),
  }),
])

const CELL_CLASS: Record<string, string> = {
  transaction: "min-w-56 py-3 pl-4",
  account: "py-3",
  vendorOrderId: "py-3",
  amount: "py-3 pr-2",
  createdAt: "hidden py-3 lg:table-cell",
  actions: "w-12 py-3 pr-4 text-end",
}

type TransactionTableProps = {
  rows: LedgerRow[]
  isRefreshing: boolean
  onView: (row: LedgerRow) => void
}

export function TransactionTable({
  rows,
  isRefreshing,
  onView,
}: TransactionTableProps) {
  const columnsWithActions = useMemo(
    () => [
      ...columns,
      columnHelper.display({
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <TransactionRowActions row={row.original} onView={onView} />
        ),
      }),
    ],
    [onView]
  )

  const table = useTable({
    features,
    columns: columnsWithActions,
    data: rows,
    getRowId: (row) => row.id,
  })

  return (
    <div
      className={cn(
        "transition-opacity",
        isRefreshing && "pointer-events-none opacity-70"
      )}
    >
      <Table>
        <TableCaption className="sr-only">Wallet transactions</TableCaption>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="bg-muted/40 hover:bg-muted/40"
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    "h-11 px-2 text-xs font-medium text-muted-foreground",
                    header.id === "amount" && "text-right",
                    header.id === "transaction" && "pl-4",
                    header.id === "actions" && "pr-4"
                  )}
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
              onClick={() => onView(row.original)}
              onKeyDown={(event) => {
                if (event.target !== event.currentTarget) {
                  return
                }

                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
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

const ACCOUNT_BADGE: Record<string, { color: BadgeColor; icon: LucideIcon }> = {
  pending: { color: "warning", icon: Clock },
  available: { color: "success", icon: Wallet },
  reserved: { color: "info", icon: Lock },
}

function AccountBadge({ account }: { account: string }) {
  const badge = ACCOUNT_BADGE[account] ?? {
    color: "neutral" as const,
    icon: Wallet,
  }

  return (
    <CustomBadge
      name={ledgerAccountLabel(account)}
      color={badge.color}
      icon={badge.icon}
      className="max-w-full"
    />
  )
}

function TransactionIdentity({ row }: { row: LedgerRow }) {
  const credit = isLedgerCredit(row.type, row.account)

  return (
    <div className="flex items-center gap-3">
      <TransactionDirectionIcon credit={credit} />
      <div className="min-w-0">
        <p className="truncate font-medium">{ledgerTypeLabel(row.type)}</p>
        <p className="truncate text-xs text-muted-foreground lg:hidden">
          {formatFinanceDateTime(row.createdAt)}
        </p>
        <p className="truncate font-mono text-[0.65rem] text-muted-foreground/80">
          {shortenId(row.id, 10)}
        </p>
      </div>
    </div>
  )
}

function TransactionRowActions({
  row,
  onView,
}: {
  row: LedgerRow
  onView: (row: LedgerRow) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="cursor-pointer"
          aria-label={`Actions for transaction ${row.id}`}
        >
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-auto min-w-40"
        onClick={(event) => event.stopPropagation()}
      >
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={() => onView(row)}
        >
          <Eye />
          View details
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
