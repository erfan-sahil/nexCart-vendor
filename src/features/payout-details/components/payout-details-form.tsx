import { useEffect, useState, type ReactNode } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm, useWatch } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useUpdateStore } from "@/features/store/hooks"
import type { VendorStore } from "@/features/store/types"
import { ApiError } from "@/lib/api/errors"

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
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-medium">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  )
}

function messageOf(error: { message?: string } | undefined) {
  return error?.message
}

export function PayoutDetailsForm({ store }: PayoutDetailsFormProps) {
  const updateStore = useUpdateStore()
  const [notice, setNotice] = useState<string | null>(null)
  const form = useForm<PayoutDetailsFormValues>({
    resolver: zodResolver(payoutDetailsSchema),
    defaultValues: payoutFromStore(store),
  })
  const payoutMethod = useWatch({ control: form.control, name: "payoutMethod" })
  const saving = updateStore.isPending
  const dirty = form.formState.isDirty
  const rootError = form.formState.errors.root?.message

  useEffect(() => {
    if (form.formState.isDirty) {
      return
    }

    form.reset(payoutFromStore(store))
  }, [form, store])

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
      setNotice("Payout details updated")
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
    }
  }

  return (
    <form
      className="flex flex-col gap-6 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5"
      noValidate
      onSubmit={form.handleSubmit(onValid)}
    >
      <Section
        title="Withdrawal account"
        description="Bank or mobile account used when this store requests withdrawals from earnings."
      >
        <Field
          data-invalid={form.formState.errors.payoutMethod ? true : undefined}
        >
          <FieldLabel htmlFor="payout-method">Method</FieldLabel>
          <Controller
            name="payoutMethod"
            control={form.control}
            render={({ field }) => (
              <Select
                value={field.value || "unset"}
                disabled={saving}
                onValueChange={(value) => {
                  field.onChange(value === "unset" ? "" : value)
                  setNotice(null)
                }}
              >
                <SelectTrigger
                  id="payout-method"
                  className="w-full"
                  aria-invalid={Boolean(form.formState.errors.payoutMethod)}
                >
                  <SelectValue placeholder="No payout account" />
                </SelectTrigger>
                <SelectContent>
                  {store.payout ? null : (
                    <SelectItem value="unset">No payout account</SelectItem>
                  )}
                  <SelectItem value="bank">Bank account</SelectItem>
                  <SelectItem value="mobile">Mobile wallet</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <FieldError>
            {messageOf(form.formState.errors.payoutMethod)}
          </FieldError>
        </Field>

        {payoutMethod ? (
          <div className="grid gap-4 sm:grid-cols-2">
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
                aria-invalid={Boolean(form.formState.errors.accountHolderName)}
                disabled={saving}
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
                    disabled={saving}
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
                    disabled={saving}
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
                    aria-invalid={Boolean(form.formState.errors.accountNumber)}
                    disabled={saving}
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
                    aria-invalid={Boolean(form.formState.errors.routingNumber)}
                    disabled={saving}
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
                    disabled={saving}
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
                    aria-invalid={Boolean(form.formState.errors.accountNumber)}
                    disabled={saving}
                    {...form.register("accountNumber")}
                  />
                  <FieldError>
                    {messageOf(form.formState.errors.accountNumber)}
                  </FieldError>
                </Field>
              </>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Add a payout account before requesting withdrawals from Finance.
          </p>
        )}

        {store.payout?.updatedAt ? (
          <p className="text-xs text-muted-foreground">
            Last updated{" "}
            {new Intl.DateTimeFormat(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(store.payout.updatedAt))}
          </p>
        ) : null}
      </Section>

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

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={saving || !dirty}>
          {saving ? "Saving…" : "Save payout details"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={saving || !dirty}
          onClick={() => {
            form.reset(payoutFromStore(store))
            setNotice(null)
            form.clearErrors()
          }}
        >
          Discard changes
        </Button>
      </div>
    </form>
  )
}
