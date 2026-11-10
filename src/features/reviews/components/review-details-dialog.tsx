import { MessageSquareReply } from "@/lib/icons"

import { CustomBadge } from "@/components/shared"
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

import type { StoreReview } from "../types"
import { ReviewStars } from "./review-stars"
import {
  ReviewContextCard,
  ReviewDialogSection,
  ReviewProductPanel,
  ReviewReplyThread,
} from "./review-dialog-shared"

type ReviewDetailsDialogProps = {
  review: StoreReview | null
  onClose: () => void
  onReply?: (review: StoreReview) => void
}

export function ReviewDetailsDialog({
  review,
  onClose,
  onReply,
}: ReviewDetailsDialogProps) {
  if (!review) {
    return null
  }

  const canReply = !review.hasVendorReply && Boolean(onReply)

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        shell
        className="h-[min(42rem,calc(100dvh-2rem))] sm:max-w-xl"
      >
        <DialogHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-2">
              <p className="text-xs font-medium text-brand-text">
                {review.product.name}
              </p>
              <DialogTitle className="text-lg">Review details</DialogTitle>
              <DialogDescription className="text-pretty">
                Buyer feedback on a product from your store.
              </DialogDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <ReviewStars rating={review.rating} className="[&_svg]:size-4" />
              {review.hasVendorReply ? (
                <CustomBadge name="You replied" color="success" />
              ) : (
                <CustomBadge name="Awaiting reply" color="warning" />
              )}
            </div>
          </div>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-5">
          <ReviewContextCard review={review} />

          <ReviewDialogSection title="Listing">
            <ReviewProductPanel review={review} />
          </ReviewDialogSection>

          <ReviewDialogSection
            title="Conversation"
            meta={String(review.replyCount)}
          >
            <ReviewReplyThread replies={review.replies} />
          </ReviewDialogSection>
        </DialogBody>

        <DialogFooter className="gap-2 sm:justify-between">
          {canReply ? (
            <Button
              type="button"
              className="cursor-pointer"
              onClick={() => {
                onClose()
                onReply?.(review)
              }}
            >
              <MessageSquareReply className="size-4" />
              Reply to review
            </Button>
          ) : (
            <span />
          )}
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
