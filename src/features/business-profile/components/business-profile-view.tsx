import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  CircleCheck,
  CircleOff,
  Eye,
  EyeOff,
  IdCard,
  Pencil,
  ShieldAlert,
  ShieldQuestion,
} from "lucide-react"
import { useForm, useWatch } from "react-hook-form"

import { StatusBadge } from "@/components/shared"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ApiError } from "@/lib/api/errors"
import { notifyError, notifySuccess } from "@/lib/notify"
import { cn } from "@/lib/utils"

import { useUpdateBusinessRecords } from "../hooks"
import {
  BUSINESS_TYPE_LABEL,
  DOCUMENT_TYPE_LABEL,
  STATUS_LABEL,
} from "../labels"
import {
  businessRecordsFieldErrors,
  businessRecordsFromApplication,
  toBusinessRecordsPayload,
} from "../lib/business-records-form"
import {
  businessRecordsSchema,
  type BusinessRecordsFormValues,
} from "../lib/business-records-schema"
import type { VendorApplication } from "../types"

import { BusinessDocumentField } from "./business-document-field"

function display(value: string) {
  const trimmed = value.trim()
  return trimmed || "—"
}

function maskDocumentNumber(value: string) {
  const trimmed = value.trim()

  if (trimmed.length <= 4) {
    return trimmed || "—"
  }

  return `${"•".repeat(Math.min(trimmed.length - 4, 8))}${trimmed.slice(-4)}`
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) {
    return "?"
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase()
}

function IdentityPanel({
  fullName,
  businessType,
  documentType,
  documentNumber,
}: {
  fullName: string
  businessType: string
  documentType: string
  documentNumber: string
}) {
  const [visible, setVisible] = useState(false)
  const trimmedNumber = documentNumber.trim()
  const shownNumber = !trimmedNumber
    ? "—"
    : visible
      ? trimmedNumber
      : maskDocumentNumber(trimmedNumber)

  return (
    <section className="rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-sm font-semibold tracking-wide text-brand-text"
            aria-hidden="true"
          >
            {initialsOf(fullName)}
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-base font-medium">
              {display(fullName)}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{businessType}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-border bg-card px-3 py-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <IdCard className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">Government ID</p>
              <p className="text-xs font-medium text-muted-foreground">
                {documentType}
              </p>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <p
                className={cn(
                  "min-w-0 flex-1 truncate text-sm font-medium",
                  visible ? "tracking-normal" : "tracking-wider"
                )}
              >
                {shownNumber}
              </p>
              {trimmedNumber ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="shrink-0 rounded-full"
                  aria-label={visible ? "Hide ID number" : "Show ID number"}
                  aria-pressed={visible}
                  onClick={() => setVisible((current) => !current)}
                >
                  {visible ? (
                    <EyeOff aria-hidden="true" />
                  ) : (
                    <Eye aria-hidden="true" />
                  )}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function messageOf(error: { message?: string } | undefined) {
  return error?.message
}

type BusinessProfileViewProps = {
  application: VendorApplication
}

export function BusinessProfileView({ application }: BusinessProfileViewProps) {
  const updateRecords = useUpdateBusinessRecords()
  const [editing, setEditing] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const form = useForm<BusinessRecordsFormValues>({
    resolver: zodResolver(businessRecordsSchema),
    defaultValues: businessRecordsFromApplication(application),
  })
  const tradeLicenseDocumentUrl = useWatch({
    control: form.control,
    name: "tradeLicenseDocumentUrl",
  })
  const taxDocumentUrl = useWatch({
    control: form.control,
    name: "taxDocumentUrl",
  })
  const { personal, identity, business } = application
  const saving = updateRecords.isPending
  const locked = !editing || saving
  const dirty = form.formState.isDirty
  const rootError = form.formState.errors.root?.message
  const canEdit = application.status === "approved"
  const statusBadge =
    application.status === "approved"
      ? { tone: "success" as const, icon: CircleCheck }
      : application.status === "rejected"
        ? { tone: "danger" as const, icon: CircleOff }
        : application.status === "more_info_required"
          ? { tone: "warning" as const, icon: ShieldQuestion }
          : { tone: "neutral" as const, icon: ShieldAlert }
  const businessType = business.businessType
    ? BUSINESS_TYPE_LABEL[business.businessType]
    : "—"
  const reviewNote = application.reviewNote.trim()

  useEffect(() => {
    if (form.formState.isDirty) {
      return
    }

    form.reset(businessRecordsFromApplication(application))
  }, [application, form])

  const cancelEditing = () => {
    form.reset(businessRecordsFromApplication(application))
    setNotice(null)
    form.clearErrors()
    setEditing(false)
  }

  const onValid = async (values: BusinessRecordsFormValues) => {
    setNotice(null)

    try {
      const saved = await updateRecords.mutateAsync(
        toBusinessRecordsPayload(values)
      )
      form.reset(businessRecordsFromApplication(saved))
      setEditing(false)
      setNotice("Business records updated")
      notifySuccess("Business records updated")
    } catch (error) {
      const apiError =
        error instanceof ApiError
          ? error
          : new ApiError(0, {
              success: false,
              message: "Could not update business records. Please try again.",
              code: "UNKNOWN",
            })
      const mapped = businessRecordsFieldErrors(apiError)

      for (const [name, message] of Object.entries(mapped.fields)) {
        if (message) {
          form.setError(name as keyof BusinessRecordsFormValues, { message })
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
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-sm font-medium sm:text-base">
              {display(business.storeName)}
            </h2>
            <StatusBadge icon={statusBadge.icon} tone={statusBadge.tone}>
              {application.status === "approved"
                ? "Verified"
                : STATUS_LABEL[application.status]}
            </StatusBadge>
            {reviewNote ? (
              <Badge
                variant="secondary"
                title="Review note"
                className={cn(
                  application.status === "approved" &&
                    "border-transparent bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
                  application.status === "rejected" &&
                    "border-transparent bg-destructive/10 text-destructive",
                  application.status === "more_info_required" &&
                    "border-transparent bg-amber-500/10 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200"
                )}
              >
                {reviewNote}
              </Badge>
            ) : null}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {editing
              ? "Update trade license, tax, and registered address."
              : "Legal records from your vendor application."}
          </p>
        </div>

        {canEdit ? (
          editing ? (
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
          )
        ) : null}
      </div>

      {application.status === "rejected" ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          This application was rejected. Contact support if you need to correct
          these records.
        </p>
      ) : null}

      <Separator />

      <IdentityPanel
        fullName={personal.fullName}
        businessType={businessType}
        documentType={
          identity.documentType
            ? DOCUMENT_TYPE_LABEL[identity.documentType]
            : "—"
        }
        documentNumber={identity.documentNumber}
      />

      <Separator />

      <section className="flex flex-col gap-3">
        <div>
          <h3 className="text-sm font-medium">Compliance documents</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Trade license and tax details used for compliance.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            data-invalid={
              form.formState.errors.tradeLicenseNumber ? true : undefined
            }
          >
            <FieldLabel htmlFor="trade-license-number">
              Trade license
            </FieldLabel>
            <Input
              id="trade-license-number"
              aria-invalid={Boolean(form.formState.errors.tradeLicenseNumber)}
              disabled={locked}
              {...form.register("tradeLicenseNumber")}
            />
            <FieldError>
              {messageOf(form.formState.errors.tradeLicenseNumber)}
            </FieldError>
          </Field>
          <Field data-invalid={form.formState.errors.taxId ? true : undefined}>
            <FieldLabel htmlFor="tax-id">Tax ID</FieldLabel>
            <Input
              id="tax-id"
              aria-invalid={Boolean(form.formState.errors.taxId)}
              disabled={locked}
              {...form.register("taxId")}
            />
            <FieldError>{messageOf(form.formState.errors.taxId)}</FieldError>
          </Field>
          <BusinessDocumentField
            id="trade-license-document"
            label="Trade license document"
            value={tradeLicenseDocumentUrl}
            disabled={locked}
            error={messageOf(form.formState.errors.tradeLicenseDocumentUrl)}
            onChange={(value) => {
              form.setValue("tradeLicenseDocumentUrl", value, {
                shouldDirty: true,
                shouldValidate: true,
              })
              setNotice(null)
            }}
          />
          <BusinessDocumentField
            id="tax-document"
            label="Tax document"
            value={taxDocumentUrl}
            disabled={locked}
            error={messageOf(form.formState.errors.taxDocumentUrl)}
            onChange={(value) => {
              form.setValue("taxDocumentUrl", value, {
                shouldDirty: true,
                shouldValidate: true,
              })
              setNotice(null)
            }}
          />
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <div>
          <h3 className="text-sm font-medium">Registered address</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Legal business address on record.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Field
            className="xl:col-span-2"
            data-invalid={form.formState.errors.line1 ? true : undefined}
          >
            <FieldLabel htmlFor="business-line1">Street address</FieldLabel>
            <Input
              id="business-line1"
              autoComplete="address-line1"
              aria-invalid={Boolean(form.formState.errors.line1)}
              disabled={locked}
              {...form.register("line1")}
            />
            <FieldError>{messageOf(form.formState.errors.line1)}</FieldError>
          </Field>
          <Field
            className="xl:col-span-2"
            data-invalid={form.formState.errors.line2 ? true : undefined}
          >
            <FieldLabel htmlFor="business-line2">
              Apartment, suite, or unit
            </FieldLabel>
            <Input
              id="business-line2"
              autoComplete="address-line2"
              aria-invalid={Boolean(form.formState.errors.line2)}
              disabled={locked}
              {...form.register("line2")}
            />
            <FieldError>{messageOf(form.formState.errors.line2)}</FieldError>
          </Field>
          <Field data-invalid={form.formState.errors.city ? true : undefined}>
            <FieldLabel htmlFor="business-city">City</FieldLabel>
            <Input
              id="business-city"
              autoComplete="address-level2"
              aria-invalid={Boolean(form.formState.errors.city)}
              disabled={locked}
              {...form.register("city")}
            />
            <FieldError>{messageOf(form.formState.errors.city)}</FieldError>
          </Field>
          <Field data-invalid={form.formState.errors.state ? true : undefined}>
            <FieldLabel htmlFor="business-state">State</FieldLabel>
            <Input
              id="business-state"
              autoComplete="address-level1"
              aria-invalid={Boolean(form.formState.errors.state)}
              disabled={locked}
              {...form.register("state")}
            />
            <FieldError>{messageOf(form.formState.errors.state)}</FieldError>
          </Field>
          <Field
            data-invalid={form.formState.errors.postalCode ? true : undefined}
          >
            <FieldLabel htmlFor="business-postal-code">Postal code</FieldLabel>
            <Input
              id="business-postal-code"
              autoComplete="postal-code"
              aria-invalid={Boolean(form.formState.errors.postalCode)}
              disabled={locked}
              {...form.register("postalCode")}
            />
            <FieldError>
              {messageOf(form.formState.errors.postalCode)}
            </FieldError>
          </Field>
          <Field
            data-invalid={form.formState.errors.country ? true : undefined}
          >
            <FieldLabel htmlFor="business-country">Country</FieldLabel>
            <Input
              id="business-country"
              autoComplete="country-name"
              aria-invalid={Boolean(form.formState.errors.country)}
              disabled={locked}
              {...form.register("country")}
            />
            <FieldError>{messageOf(form.formState.errors.country)}</FieldError>
          </Field>
        </div>
      </section>

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
