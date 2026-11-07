import type { ReactNode } from "react"
import { MessageSquare, Package, Store, type LucideIcon } from "lucide-react"

import { CustomBadge } from "@/components/shared"
import { cn } from "@/lib/utils"

import { formatReviewDateTime } from "../lib/format"
import type { ReviewReply, StoreReview } from "../types"
import { ReviewStars } from "./review-stars"

export function ReviewContextCard({
  review,
  compact = false,
}: {
  review: StoreReview
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-muted/20",
        compact ? "p-3" : "p-4"
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <ReviewStars rating={review.rating} />
        <span className="text-sm font-medium">{review.author.displayName}</span>
        {review.hasVendorReply ? (
          <CustomBadge name="Replied" color="success" icon={Store} />
        ) : null}
      </div>
      <p
        className={cn(
          "mt-2 text-sm leading-relaxed whitespace-pre-wrap text-foreground",
          compact && "line-clamp-4"
        )}
      >
        {review.body}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        {formatReviewDateTime(review.createdAt)}
        {review.updatedAt !== review.createdAt
          ? ` · edited ${formatReviewDateTime(review.updatedAt)}`
          : null}
      </p>
    </div>
  )
}

export function ReviewProductPanel({ review }: { review: StoreReview }) {
  return (
    <dl className="min-w-0 rounded-xl border border-border">
      <MetaRow
        icon={Package}
        label="Product"
        value={review.product.name}
        detail={review.product.slug || undefined}
      />
      <MetaRow
        icon={Store}
        label="Store"
        value={review.store.name}
        detail={`${review.replyCount} ${review.replyCount === 1 ? "reply" : "replies"}`}
      />
    </dl>
  )
}

export function ReviewReplyThread({
  replies,
  emptyLabel = "No replies yet.",
}: {
  replies: ReviewReply[]
  emptyLabel?: string
}) {
  if (replies.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {replies.map((item) => (
        <li
          key={item.id}
          className={cn(
            "rounded-xl border border-border px-3.5 py-3",
            item.isMine && "border-brand/25 bg-brand-soft/40"
          )}
        >
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold">
              {item.author.displayName}
              {item.isMine ? (
                <span className="font-normal text-muted-foreground">
                  {" "}
                  · you
                </span>
              ) : null}
            </p>
            {item.isMine ? (
              <CustomBadge
                name="Vendor"
                color="neutral"
                className="text-[0.65rem]"
              />
            ) : null}
          </div>
          <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-wrap">
            {item.body}
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {formatReviewDateTime(item.createdAt)}
            {item.updatedAt !== item.createdAt
              ? ` · edited ${formatReviewDateTime(item.updatedAt)}`
              : null}
          </p>
        </li>
      ))}
    </ul>
  )
}

function MetaRow({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: LucideIcon
  label: string
  value: string
  detail?: string
}) {
  return (
    <div className="flex items-start gap-3 border-b border-border px-3.5 py-3 last:border-b-0">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 text-sm font-semibold wrap-break-word">
          {value}
        </dd>
        {detail ? (
          <dd className="mt-0.5 text-xs wrap-break-word text-muted-foreground">
            {detail}
          </dd>
        ) : null}
      </div>
    </div>
  )
}

export function ReviewDialogSection({
  title,
  meta,
  children,
}: {
  title: string
  meta?: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {title}
        </h3>
        {meta ? (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MessageSquare className="size-3" aria-hidden="true" />
            {meta}
          </span>
        ) : null}
      </div>
      {children}
    </section>
  )
}
