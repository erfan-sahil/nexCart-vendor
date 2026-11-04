import { useCallback, useMemo, useState } from "react"
import { Loader2, Search } from "lucide-react"

import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ApiError } from "@/lib/api/errors"

import { useDebouncedValue, useStoreReviewsQuery } from "../hooks"
import { RATING_FILTER_LABEL } from "../labels"
import type { RatingFilter, StoreReview } from "../types"
import { ReviewReplyDialog } from "./review-reply-dialog"
import { ReviewTable } from "./review-table"

const RATING_FILTERS: RatingFilter[] = ["all", "5", "4", "3", "2", "1"]

export function StoreReviewsView() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [search, setSearch] = useState("")
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all")
  const [selected, setSelected] = useState<StoreReview | null>(null)
  const debouncedSearch = useDebouncedValue(search.trim(), 350)

  const params = useMemo(
    () => ({
      page,
      limit: pageSize,
      ...(ratingFilter !== "all" ? { rating: Number(ratingFilter) } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
    [page, pageSize, ratingFilter, debouncedSearch]
  )

  const reviewsQuery = useStoreReviewsQuery(params)
  const items = reviewsQuery.data?.items ?? []
  const pagination = reviewsQuery.data?.pagination
  const errorMessage =
    reviewsQuery.error instanceof ApiError
      ? reviewsQuery.error.message
      : reviewsQuery.isError
        ? "Could not load reviews."
        : null

  const handleOpen = useCallback((review: StoreReview) => {
    setSelected(review)
  }, [])

  return (
    <section className="flex w-full flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Reviews
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Buyer reviews left on products from your store. Reply to build trust
          with shoppers.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5">
        <FieldGroup className="gap-4 sm:flex-row sm:items-end">
          <Field className="min-w-0 flex-1">
            <FieldLabel htmlFor="vendor-review-search">Search</FieldLabel>
            <InputGroup className="h-10">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                id="vendor-review-search"
                className="h-10"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
                placeholder="Search by comment or product name"
              />
            </InputGroup>
          </Field>
          <Field className="sm:w-44">
            <FieldLabel htmlFor="vendor-review-rating">Rating</FieldLabel>
            <Select
              value={ratingFilter}
              onValueChange={(value) => {
                setRatingFilter(value as RatingFilter)
                setPage(1)
              }}
            >
              <SelectTrigger id="vendor-review-rating" className="h-10! w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {RATING_FILTERS.map((filter) => (
                  <SelectItem key={filter} value={filter}>
                    {RATING_FILTER_LABEL[filter]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-semibold">Store reviews</h2>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground tabular-nums">
              {pagination ? pagination.total : "—"}
            </span>
          </div>
          {reviewsQuery.isFetching && !reviewsQuery.isLoading ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Refreshing
            </span>
          ) : null}
        </div>

        <ReviewTable
          items={items}
          isLoading={reviewsQuery.isLoading}
          isFetching={reviewsQuery.isFetching}
          errorMessage={errorMessage}
          emptyLabel={
            debouncedSearch || ratingFilter !== "all"
              ? "No reviews match these filters."
              : "When buyers review your products, they will show up here."
          }
          page={pagination?.page ?? page}
          pageSize={pagination?.limit ?? pageSize}
          total={pagination?.total ?? 0}
          totalPages={pagination?.totalPages ?? 0}
          onPageChange={setPage}
          onRetry={() => void reviewsQuery.refetch()}
          onOpen={handleOpen}
        />
      </div>

      <ReviewReplyDialog
        review={selected}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
      />
    </section>
  )
}
