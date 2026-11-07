import { Star } from "lucide-react"

import { ReviewStars } from "@/features/reviews/components/review-stars"

import { PanelSecondaryLink } from "./panel-secondary-link"
import { dashboardPanelClass } from "../lib/dashboard-surface"

type StoreRatingCardProps = {
  average: number | null
  count: number
}

export function StoreRatingCard({ average, count }: StoreRatingCardProps) {
  return (
    <article className={`p-4 sm:p-6 ${dashboardPanelClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200">
            <Star className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-semibold">Store rating</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              From customer product reviews.
            </p>
          </div>
        </div>
        <PanelSecondaryLink to="/store/reviews">Reviews</PanelSecondaryLink>
      </div>
      {count === 0 || average === null ? (
        <p className="mt-6 text-sm text-muted-foreground">No reviews yet.</p>
      ) : (
        <div className="mt-4 flex items-center gap-3">
          <p className="text-3xl font-semibold tabular-nums">
            {average.toFixed(1)}
          </p>
          <div>
            <ReviewStars rating={average} />
            <p className="mt-1 text-xs text-muted-foreground">
              {count} review{count === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      )}
    </article>
  )
}
