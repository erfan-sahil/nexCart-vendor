import { useState } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { ApiError } from "@/lib/api/errors"

import { useCreateStoreReviewReplyMutation } from "../hooks"
import { formatReviewDateTime } from "../lib/format"
import { REVIEW_BODY_MAX, REVIEW_BODY_MIN } from "../labels"
import type { StoreReview } from "../types"
import { ReviewStars } from "./review-stars"

type ReviewReplyDialogProps = {
  review: StoreReview | null
  open: boolean
  onClose: () => void
}

export function ReviewReplyDialog({
  review,
  open,
  onClose,
}: ReviewReplyDialogProps) {
  const [body, setBody] = useState("")
  const [error, setError] = useState<string | null>(null)
  const reply = useCreateStoreReviewReplyMutation()
  const alreadyReplied = Boolean(review?.hasVendorReply)
  const trimmed = body.trim()
  const tooShort = trimmed.length > 0 && trimmed.length < REVIEW_BODY_MIN
  const canSubmit =
    Boolean(review) &&
    !alreadyReplied &&
    trimmed.length >= REVIEW_BODY_MIN &&
    trimmed.length <= REVIEW_BODY_MAX &&
    !reply.isPending

  const resetAndClose = () => {
    setBody("")
    setError(null)
    onClose()
  }

  const onSubmit = async () => {
    if (!review || !canSubmit) {
      return
    }

    setError(null)

    try {
      await reply.mutateAsync({
        productId: review.product.id,
        reviewId: review.id,
        body: trimmed,
      })
      resetAndClose()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not post your reply. Try again."
      )
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          resetAndClose()
        }
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {alreadyReplied ? "Review thread" : "Reply to review"}
          </DialogTitle>
          <DialogDescription>
            {alreadyReplied
              ? "You already replied to this buyer review."
              : `Respond publicly to feedback on ${review?.product.name ?? "this product"}.`}
          </DialogDescription>
        </DialogHeader>

        {review ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <div className="flex items-center gap-2">
                <ReviewStars rating={review.rating} />
                <span className="text-xs text-muted-foreground">
                  {review.author.displayName}
                </span>
              </div>
              <p className="mt-2 text-sm whitespace-pre-wrap">{review.body}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatReviewDateTime(review.createdAt)} · {review.product.name}
              </p>
            </div>

            {review.replies.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">Replies</p>
                <ul className="space-y-2">
                  {review.replies.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-lg border border-border px-3 py-2"
                    >
                      <p className="text-xs font-medium">
                        {item.author.displayName}
                        {item.isMine ? " (you)" : ""}
                      </p>
                      <p className="mt-1 text-sm whitespace-pre-wrap">
                        {item.body}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatReviewDateTime(item.createdAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {!alreadyReplied ? (
              <Field>
                <FieldLabel htmlFor="vendor-review-reply">
                  Your reply
                </FieldLabel>
                <Textarea
                  id="vendor-review-reply"
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="Thank the buyer and address their feedback…"
                  rows={4}
                  maxLength={REVIEW_BODY_MAX}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {trimmed.length}/{REVIEW_BODY_MAX}
                  {tooShort
                    ? ` · at least ${REVIEW_BODY_MIN} characters`
                    : null}
                </p>
              </Field>
            ) : null}

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={resetAndClose}>
            Close
          </Button>
          {!alreadyReplied ? (
            <Button
              type="button"
              disabled={!canSubmit}
              onClick={() => {
                void onSubmit()
              }}
            >
              {reply.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Post reply
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
