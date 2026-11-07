"use client"

import { ArrowDownToLine, ExternalLink, Loader2 } from "lucide-react"
import { Link } from "react-router"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"

import { formatBdt } from "../lib/format"

type WithdrawalRequestCardProps = {
  available: number
  amount: string
  formError: string | null
  isBalanceLoading: boolean
  isSubmitting: boolean
  onAmountChange: (value: string) => void
  onSubmit: () => void
}

export function WithdrawalRequestCard({
  available,
  amount,
  formError,
  isBalanceLoading,
  isSubmitting,
  onAmountChange,
  onSubmit,
}: WithdrawalRequestCardProps) {
  const disabled = isSubmitting || isBalanceLoading
  const canWithdraw = available > 0 && !disabled

  return (
    <Card className="overflow-hidden border border-border shadow-sm ring-0">
      <CardHeader className="border-b border-border bg-muted/20 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base">Request withdrawal</CardTitle>
            <CardDescription className="max-w-lg">
              Transfer cleared funds to the payout account in your settings.
              Requests are reviewed before transfer.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" className="shrink-0" asChild>
            <Link to="/settings/payout-details">
              Payout settings
              <ExternalLink
                className="size-3.5 opacity-70"
                aria-hidden="true"
              />
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit()
          }}
        >
          <div className="flex flex-col gap-4 rounded-xl border border-border/80 bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Available balance
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
                {isBalanceLoading ? "—" : formatBdt(available)}
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="shrink-0"
              disabled={!canWithdraw}
              onClick={() => onAmountChange(available.toFixed(2))}
            >
              Withdraw maximum
            </Button>
          </div>

          <Field data-invalid={formError ? true : undefined}>
            <FieldLabel htmlFor="withdrawal-amount">
              Withdrawal amount
            </FieldLabel>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <InputGroup
                className={cn(
                  "h-11 w-full sm:flex-1",
                  formError && "border-destructive ring-3 ring-destructive/20"
                )}
              >
                <InputGroupInput
                  id="withdrawal-amount"
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0.00"
                  className="text-base tabular-nums sm:text-lg"
                  value={amount}
                  disabled={disabled}
                  aria-invalid={formError ? true : undefined}
                  onChange={(event) => onAmountChange(event.target.value)}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupText className="font-medium text-foreground">
                    Tk
                  </InputGroupText>
                  <InputGroupButton
                    type="button"
                    variant="ghost"
                    disabled={!canWithdraw}
                    onClick={() => onAmountChange(available.toFixed(2))}
                  >
                    Max
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>

              <Button
                type="submit"
                size="lg"
                className="h-11 w-full shrink-0 sm:w-auto sm:min-w-44"
                disabled={disabled || !amount.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />
                    Submitting…
                  </>
                ) : (
                  <>
                    <ArrowDownToLine aria-hidden="true" />
                    Request withdrawal
                  </>
                )}
              </Button>
            </div>
            <FieldDescription>
              Enter an amount up to {formatBdt(available)}. Amounts are in Tk.
            </FieldDescription>
            {formError ? <FieldError>{formError}</FieldError> : null}
          </Field>
        </form>
      </CardContent>

      <CardFooter className="border-t border-border bg-muted/20 text-xs text-muted-foreground">
        Ensure payout details are correct before submitting. You can cancel
        pending requests from the history table below.
      </CardFooter>
    </Card>
  )
}
