import { useEffect, useState, type ReactNode } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Building2, Pencil, Smartphone, type AppIcon } from "@/lib/icons"
import { Controller, useForm, useWatch } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useUpdateStore } from "@/features/store/hooks"
import type { VendorStore } from "@/features/store/types"
import { ApiError } from "@/lib/api/errors"
import { notifyError, notifySuccess } from "@/lib/notify"
import { cn } from "@/lib/utils"

import {
  payoutFieldErrors,
  payoutFromStore,
  toPayoutUpdatePayload,
} from "../lib/payout-form"
import {
  payoutDetailsSchema,
  type PayoutDetailsFormValues,
} from "../lib/payout-form-schema"

type PayoutDetailsFormProps = {
  store: VendorStore
}

type MethodOption = {
  value: "bank" | "mobile"
  title: string
  description: string
  icon: AppIcon
}

const METHOD_OPTIONS: MethodOption[] = [
  {
    value: "bank",
    title: "Bank account",
    description: "Deposit to a bank account.",
    icon: Building2,
  },
  {
    value: "mobile",
    title: "Mobile wallet",
    description: "Send to bKash or Nagad.",
    icon: Smartphone,
  },
]

function Section({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-medium">{title}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  )
}

function MethodCard({
  option,
  selected,
  disabled,
  onSelect,
}: {
  option: MethodOption
  selected: boolean
  disabled: boolean
  onSelect: () => void
}) {
  const Icon = option.icon

  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-colors",
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:bg-muted/50",
        disabled && "cursor-not-allowed opacity-60 hover:bg-transparent"
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          selected
            ? "bg-brand-soft text-brand-text"
            : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium">{option.title}</span>
        <span className="mt-0.5 block text-sm text-muted-foreground">
          {option.description}
        </span>
      </span>
    </button>
  )
}

function messageOf(error: { message?: string } | undefined) {
  return error?.message
}

export function PayoutDetailsForm({ store }: PayoutDetailsFormProps) {
  const updateStore = useUpdateStore()
  const [editing, setEditing] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const form = useForm<PayoutDetailsFormValues>({
    resolver: zodResolver(payoutDetailsSchema),
    defaultValues: payoutFromStore(store),
  })
  const payoutMethod = useWatch({ control: form.control, name: "payoutMethod" })
  const saving = updateStore.isPending
  const locked = !editing || saving
  const dirty = form.formState.isDirty
  const rootError = form.formState.errors.root?.message
  const methodError = messageOf(form.formState.errors.payoutMethod)

  useEffect(() => {
    if (form.formState.isDirty) {
      return
    }

    form.reset(payoutFromStore(store))
  }, [form, store])

  const cancelEditing = () => {
    form.reset(payoutFromStore(store))
    setNotice(null)
    form.clearErrors()
    setEditing(false)
  }

  const onValid = async (values: PayoutDetailsFormValues) => {
    setNotice(null)
    const payload = toPayoutUpdatePayload(values)

    if (!payload) {
      form.setError("root", {
        message: "Choose a payout method before saving.",
      })
      return
    }

    try {
      const saved = await updateStore.mutateAsync({
        payload,
        logo: null,
        banner: null,
      })
      form.reset(payoutFromStore(saved))
      setEditing(false)
      setNotice("Payout details updated")
      notifySuccess("Payout details updated")
    } catch (error) {
      const apiError =
        error instanceof ApiError
          ? error
          : new ApiError(0, {
              success: false,
              message: "Could not save payout details. Please try again.",
              code: "UNKNOWN",
            })
      const mapped = payoutFieldErrors(apiError)

      for (const [name, message] of Object.entries(mapped.fields)) {
        if (message) {
          form.setError(name as keyof PayoutDetailsFormValues, { message })
        }
      }

      if (mapped.message) {
        form.setError("root", { message: mapped.message })
      }

      notifyError(error, mapped.message ?? apiError.message)
    }
  }

  return (
    <form
      className="flex w-full flex-col gap-5 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5"
      noValidate
      onSubmit={form.handleSubmit(onValid)}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium">Withdrawal account</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {editing
              ? "Update where store withdrawals are sent."
              : "Review your withdrawal account. Click Edit to make changes."}
          </p>
        </div>
        {editing ? (
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={saving || !dirty}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={cancelEditing}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setNotice(null)
              setEditing(true)
            }}
          >
            <Pencil />
            Edit
          </Button>
        )}
      </div>

      <Separator />

      <Section title="Method" description="Bank transfer or mobile wallet.">
        <Controller
          name="payoutMethod"
          control={form.control}
          render={({ field }) => (
            <div
              className="grid gap-3 sm:grid-cols-2"
              role="group"
              aria-label="Payout method"
            >
              {METHOD_OPTIONS.map((option) => (
                <MethodCard
                  key={option.value}
                  option={option}
                  selected={field.value === option.value}
                  disabled={locked}
                  onSelect={() => {
                    field.onChange(option.value)
                    setNotice(null)
                    form.clearErrors("payoutMethod")
                  }}
                />
              ))}
            </div>
          )}
        />
        {methodError ? (
          <p className="text-sm text-destructive" role="alert">
            {methodError}
          </p>
        ) : null}
      </Section>

      {payoutMethod ? (
        <>
          <Separator />
          <Section
            title="Account details"
            description={
              payoutMethod === "bank"
                ? "Details for bank withdrawals."
                : "Details for mobile wallet withdrawals."
            }
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Field
                className="sm:col-span-2"
                data-invalid={
                  form.formState.errors.accountHolderName ? true : undefined
                }
              >
                <FieldLabel htmlFor="payout-account-holder">
                  Account holder
                </FieldLabel>
                <Input
                  id="payout-account-holder"
                  autoComplete="name"
                  aria-invalid={Boolean(
                    form.formState.errors.accountHolderName
                  )}
                  disabled={locked}
                  {...form.register("accountHolderName")}
                />
                <FieldError>
                  {messageOf(form.formState.errors.accountHolderName)}
                </FieldError>
              </Field>

              {payoutMethod === "bank" ? (
                <>
                  <Field
                    data-invalid={
                      form.formState.errors.bankName ? true : undefined
                    }
                  >
                    <FieldLabel htmlFor="payout-bank-name">Bank</FieldLabel>
                    <Input
                      id="payout-bank-name"
                      aria-invalid={Boolean(form.formState.errors.bankName)}
                      disabled={locked}
                      {...form.register("bankName")}
                    />
                    <FieldError>
                      {messageOf(form.formState.errors.bankName)}
                    </FieldError>
                  </Field>
                  <Field
                    data-invalid={
                      form.formState.errors.branchName ? true : undefined
                    }
                  >
                    <FieldLabel htmlFor="payout-branch-name">Branch</FieldLabel>
                    <Input
                      id="payout-branch-name"
                      aria-invalid={Boolean(form.formState.errors.branchName)}
                      disabled={locked}
                      {...form.register("branchName")}
                    />
                    <FieldError>
                      {messageOf(form.formState.errors.branchName)}
                    </FieldError>
                  </Field>
                  <Field
                    data-invalid={
                      form.formState.errors.accountNumber ? true : undefined
                    }
                  >
                    <FieldLabel htmlFor="payout-account-number">
                      Account number
                    </FieldLabel>
                    <Input
                      id="payout-account-number"
                      aria-invalid={Boolean(
                        form.formState.errors.accountNumber
                      )}
                      disabled={locked}
                      {...form.register("accountNumber")}
                    />
                    <FieldError>
                      {messageOf(form.formState.errors.accountNumber)}
                    </FieldError>
                  </Field>
                  <Field
                    data-invalid={
                      form.formState.errors.routingNumber ? true : undefined
                    }
                  >
                    <FieldLabel htmlFor="payout-routing-number">
                      Routing number
                    </FieldLabel>
                    <Input
                      id="payout-routing-number"
                      aria-invalid={Boolean(
                        form.formState.errors.routingNumber
                      )}
                      disabled={locked}
                      {...form.register("routingNumber")}
                    />
                    <FieldDescription>Optional.</FieldDescription>
                    <FieldError>
                      {messageOf(form.formState.errors.routingNumber)}
                    </FieldError>
                  </Field>
                </>
              ) : (
                <>
                  <Field
                    data-invalid={
                      form.formState.errors.provider ? true : undefined
                    }
                  >
                    <FieldLabel htmlFor="payout-provider">Provider</FieldLabel>
                    <Input
                      id="payout-provider"
                      placeholder="bkash or nagad"
                      aria-invalid={Boolean(form.formState.errors.provider)}
                      disabled={locked}
                      {...form.register("provider")}
                    />
                    <FieldError>
                      {messageOf(form.formState.errors.provider)}
                    </FieldError>
                  </Field>
                  <Field
                    data-invalid={
                      form.formState.errors.accountNumber ? true : undefined
                    }
                  >
                    <FieldLabel htmlFor="payout-mobile-number">
                      Account number
                    </FieldLabel>
                    <Input
                      id="payout-mobile-number"
                      placeholder="+8801712345678"
                      aria-invalid={Boolean(
                        form.formState.errors.accountNumber
                      )}
                      disabled={locked}
                      {...form.register("accountNumber")}
                    />
                    <FieldError>
                      {messageOf(form.formState.errors.accountNumber)}
                    </FieldError>
                  </Field>
                </>
              )}
            </div>
          </Section>
        </>
      ) : null}

      {rootError ? (
        <p className="text-sm text-destructive" role="alert">
          {rootError}
        </p>
      ) : null}
      {notice ? (
        <p
          className="text-sm text-emerald-700 dark:text-emerald-300"
          role="status"
        >
          {notice}
        </p>
      ) : null}

      {editing ? (
        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          <Button type="submit" disabled={saving || !dirty}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={cancelEditing}
          >
            Cancel
          </Button>
        </div>
      ) : null}
    </form>
  )
}
