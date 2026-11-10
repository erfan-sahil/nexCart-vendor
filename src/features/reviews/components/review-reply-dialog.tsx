import { useState } from "react"
import { Loader2, MessageSquareReply } from "@/lib/icons"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { ApiError } from "@/lib/api/errors"
import { notifyError, notifySuccess } from "@/lib/notify"

import { useCreateStoreReviewReplyMutation } from "../hooks"
import { REVIEW_BODY_MAX, REVIEW_BODY_MIN } from "../labels"
import type { StoreReview } from "../types"
import { ReviewContextCard } from "./review-dialog-shared"

type ReviewReplyDialogProps = {
  review: StoreReview | null
  onClose: () => void
}

export function ReviewReplyDialog({ review, onClose }: ReviewReplyDialogProps) {
  if (!review) {
    return null
  }

  return <ReviewReplyForm key={review.id} review={review} onClose={onClose} />
}

function ReviewReplyForm({
  review,
  onClose,
}: {
  review: StoreReview
  onClose: () => void
}) {
  const [body, setBody] = useState("")
  const [error, setError] = useState<string | null>(null)
  const reply = useCreateStoreReviewReplyMutation()
  const trimmed = body.trim()
  const tooShort = trimmed.length > 0 && trimmed.length < REVIEW_BODY_MIN
  const blocked = review.hasVendorReply
  const canSubmit =
    !blocked &&
    trimmed.length >= REVIEW_BODY_MIN &&
    trimmed.length <= REVIEW_BODY_MAX &&
    !reply.isPending

  const resetAndClose = () => {
    onClose()
  }

  const onSubmit = async () => {
    if (!canSubmit) {
      return
    }

    setError(null)

    try {
      await reply.mutateAsync({
        productId: review.product.id,
        reviewId: review.id,
        body: trimmed,
      })
      notifySuccess("Reply posted")
      resetAndClose()
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Could not post your reply. Try again."

      setError(message)
      notifyError(err, message)
    }
  }

  return (
    <Dialog open onOpenChange={(next) => !next && resetAndClose()}>
      <DialogContent shell className="sm:max-w-lg">
        <DialogHeader>
          <p className="text-xs font-medium text-brand-text">
            {review.product.name}
          </p>
          <DialogTitle className="mt-1">Reply to review</DialogTitle>
          <DialogDescription>
            Your response is public and appears under this buyer&apos;s review.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-4">
          <ReviewContextCard review={review} compact />

          {blocked ? (
            <p className="rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground">
              You already posted a store reply. Open review details to read the
              full thread.
            </p>
          ) : (
            <Field>
              <FieldLabel htmlFor="vendor-review-reply">Your reply</FieldLabel>
              <Textarea
                id="vendor-review-reply"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Thank the buyer and address their feedback…"
                rows={5}
                maxLength={REVIEW_BODY_MAX}
                className="min-h-[7.5rem] resize-y"
              />
              <FieldDescription className="flex flex-wrap gap-x-2">
                <span>
                  {trimmed.length}/{REVIEW_BODY_MAX} characters
                </span>
                {tooShort ? (
                  <span className="text-destructive">
                    At least {REVIEW_BODY_MIN} characters required
                  </span>
                ) : (
                  <span>Minimum {REVIEW_BODY_MIN} characters</span>
                )}
              </FieldDescription>
            </Field>
          )}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </DialogBody>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={resetAndClose}
          >
            Cancel
          </Button>
          {!blocked ? (
            <Button
              type="button"
              className="cursor-pointer"
              disabled={!canSubmit}
              onClick={() => {
                void onSubmit()
              }}
            >
              {reply.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <MessageSquareReply className="size-4" />
              )}
              Post reply
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
