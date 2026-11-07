import {
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  Eye,
  Loader2,
  MessageSquare,
  MessageSquareReply,
  Store,
} from "lucide-react"

import { CustomBadge } from "@/components/shared"
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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { formatReviewDateTime } from "../lib/format"
import type { StoreReview } from "../types"
import { ReviewStars } from "./review-stars"

type ReviewTableProps = {
  items: StoreReview[]
  isLoading: boolean
  isFetching: boolean
  errorMessage: string | null
  emptyLabel: string
  page: number
  pageSize: number
  total: number
  totalPages: number
  onPageChange: (page: number) => void
  onRetry: () => void
  onView: (review: StoreReview) => void
  onReply: (review: StoreReview) => void
}

export function ReviewTable({
  items,
  isLoading,
  isFetching,
  errorMessage,
  emptyLabel,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onRetry,
  onView,
  onReply,
}: ReviewTableProps) {
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, total)

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Review</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Replies</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-16 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 6 }, (_, index) => (
              <TableRow
                key={index}
                className="pointer-events-none hover:[&>td]:!bg-transparent"
              >
                <TableCell colSpan={5} className="px-4 py-3">
                  <div className="h-10 animate-pulse rounded-md bg-muted" />
                </TableCell>
              </TableRow>
            ))
          ) : errorMessage ? (
            <TableRow className="pointer-events-none hover:[&>td]:!bg-transparent">
              <TableCell colSpan={5} className="px-5 py-16">
                <div className="flex flex-col items-center text-center">
                  <p className="text-sm font-medium text-destructive">
                    {errorMessage}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    onClick={onRetry}
                  >
                    Try again
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ) : items.length === 0 ? (
            <TableRow className="pointer-events-none hover:[&>td]:!bg-transparent">
              <TableCell colSpan={5} className="px-5 py-16">
                <div className="mx-auto max-w-md text-center">
                  <p className="text-sm font-medium">No reviews yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {emptyLabel}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            items.map((review) => (
              <TableRow key={review.id}>
                <TableCell className="max-w-80 px-3 py-2.5 first:pl-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ReviewStars rating={review.rating} />
                      <span className="truncate text-xs text-muted-foreground">
                        {review.author.displayName}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-sm">{review.body}</p>
                  </div>
                </TableCell>
                <TableCell className="max-w-48 px-3 py-2.5">
                  <p className="truncate text-sm font-medium">
                    {review.product.name}
                  </p>
                  {review.product.slug ? (
                    <p className="truncate text-xs text-muted-foreground">
                      {review.product.slug}
                    </p>
                  ) : null}
                </TableCell>
                <TableCell className="px-3 py-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                      <MessageSquare className="size-3.5" />
                      {review.replyCount}
                    </span>
                    {review.hasVendorReply ? (
                      <CustomBadge
                        name="Replied"
                        color="success"
                        icon={Store}
                      />
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="px-3 py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                  {formatReviewDateTime(review.createdAt)}
                </TableCell>
                <TableCell className="px-3 py-2.5 text-right last:pr-4">
                  <ReviewRowActions
                    review={review}
                    onView={onView}
                    onReply={onReply}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {!isLoading && !errorMessage ? (
        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-xs text-muted-foreground">
            {total === 0
              ? "No results"
              : `Showing ${rangeStart}–${rangeEnd} of ${total}`}
            {isFetching ? (
              <span className="ml-2 inline-flex items-center gap-1">
                <Loader2 className="size-3 animate-spin" />
                Refreshing
              </span>
            ) : null}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <span className="text-xs text-muted-foreground tabular-nums">
              Page {page} of {Math.max(totalPages, 1)}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages || totalPages === 0}
              onClick={() => onPageChange(page + 1)}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function ReviewRowActions({
  review,
  onView,
  onReply,
}: {
  review: StoreReview
  onView: (review: StoreReview) => void
  onReply: (review: StoreReview) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="cursor-pointer"
          aria-label={`Actions for review on ${review.product.name}`}
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
          onSelect={() => onView(review)}
        >
          <Eye />
          Details
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          disabled={review.hasVendorReply}
          onSelect={() => onReply(review)}
        >
          <MessageSquareReply />
          Reply
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
