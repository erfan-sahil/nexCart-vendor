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

import { formatBdt } from "../lib/format"
import type { WithdrawalRow } from "../services/vendor-finance.api"

type WithdrawalCancelDialogProps = {
  withdrawal: WithdrawalRow | null
  open: boolean
  isPending: boolean
  onClose: () => void
  onConfirm: (id: string) => void
}

export function WithdrawalCancelDialog({
  withdrawal,
  open,
  isPending,
  onClose,
  onConfirm,
}: WithdrawalCancelDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !isPending) {
          onClose()
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel withdrawal request?</DialogTitle>
          <DialogDescription>
            {withdrawal
              ? `This will cancel your pending request for ${formatBdt(withdrawal.amount)}. The amount returns to your available balance.`
              : "This will cancel your pending withdrawal and return funds to your available balance."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={onClose}
          >
            Keep request
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending || !withdrawal}
            onClick={() => {
              if (withdrawal) {
                onConfirm(withdrawal.id)
              }
            }}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Cancelling…
              </>
            ) : (
              "Cancel withdrawal"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
