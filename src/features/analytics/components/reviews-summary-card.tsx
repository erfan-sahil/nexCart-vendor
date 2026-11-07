import { Link } from "react-router"

import { StackedBar } from "@/components/charts"
import { ReviewStars } from "@/features/reviews/components/review-stars"

import { analyticsPanelClass } from "../lib/analytics-surface"
import type { VendorAnalytics } from "../types"

type ReviewsSummaryCardProps = {
  reviews: VendorAnalytics["reviews"]
}

export function ReviewsSummaryCard({ reviews }: ReviewsSummaryCardProps) {
  const segments = reviews.distribution.map((row) => ({
    key: String(row.rating),
    label: `${row.rating} star${row.rating === 1 ? "" : "s"}`,
    value: row.count,
    className:
      row.rating >= 4
        ? "bg-emerald-500"
        : row.rating === 3
          ? "bg-amber-500"
          : "bg-rose-500",
  }))

  return (
    <article className={`p-4 sm:p-6 ${analyticsPanelClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Reviews</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Store-wide product review summary.
          </p>
        </div>
        <Link
          to="/store/reviews"
          className="shrink-0 text-xs font-medium text-brand-text hover:underline"
        >
          Manage
        </Link>
      </div>
      {reviews.total === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No reviews yet.</p>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <p className="text-3xl font-semibold tabular-nums">
              {reviews.average?.toFixed(1) ?? "—"}
            </p>
            <div>
              {reviews.average !== null ? (
                <ReviewStars rating={reviews.average} />
              ) : null}
              <p className="mt-1 text-xs text-muted-foreground">
                {reviews.total} total · {reviews.newInRange} new in period
              </p>
            </div>
          </div>
          <div className="mt-6">
            <StackedBar segments={segments} showLegend={false} />
            <ul className="mt-4 space-y-2">
              {reviews.distribution
                .slice()
                .reverse()
                .map((row) => (
                  <li
                    key={row.rating}
                    className="flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <ReviewStars rating={row.rating} />
                      <span>{row.rating} stars</span>
                    </span>
                    <span className="font-medium tabular-nums">
                      {row.count}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        </>
      )}
    </article>
  )
}
