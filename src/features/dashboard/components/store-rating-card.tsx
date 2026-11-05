import { Link } from "react-router"

import { ReviewStars } from "@/features/reviews/components/review-stars"

type StoreRatingCardProps = {
  average: number | null
  count: number
}

export function StoreRatingCard({ average, count }: StoreRatingCardProps) {
  return (
    <article className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Store rating</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            From customer product reviews.
          </p>
        </div>
        <Link
          to="/store/reviews"
          className="shrink-0 text-xs font-medium text-brand-text hover:underline"
        >
          Reviews
        </Link>
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
