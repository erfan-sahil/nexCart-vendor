import type { ReactNode } from "react"
import {
  CircleCheck,
  CircleOff,
  ExternalLink,
  ShieldAlert,
  ShieldQuestion,
} from "lucide-react"

import { StatusBadge } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { resolveAssetUrl } from "@/lib/api/assets"

import {
  BUSINESS_TYPE_LABEL,
  DOCUMENT_TYPE_LABEL,
  STATUS_LABEL,
} from "../labels"
import type { VendorAddress, VendorApplication } from "../types"

function display(value: string) {
  const trimmed = value.trim()
  return trimmed || "—"
}

function formatAddress(address: VendorAddress) {
  const street = [address.line1, address.line2].filter(Boolean).join(", ")
  const locality = [address.city, address.state, address.postalCode]
    .filter(Boolean)
    .join(", ")
  const lines = [street, locality, address.country].filter(Boolean)
  return lines.length > 0 ? lines.join("\n") : "—"
}

function formatDateOnly(value: string | null) {
  if (!value) {
    return "—"
  }

  const [year, month, day] = value.split("-").map(Number)

  if (!year || !month || !day) {
    return value
  }

  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(Date.UTC(year, month - 1, day))
  )
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "—"
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(value))
}

function maskDocumentNumber(value: string) {
  const trimmed = value.trim()

  if (trimmed.length <= 4) {
    return trimmed || "—"
  }

  return `${"•".repeat(Math.min(trimmed.length - 4, 8))}${trimmed.slice(-4)}`
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/60 px-3 py-2.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-medium">{value}</p>
    </div>
  )
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
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-medium">{title}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  )
}

function DetailField({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <Field className={className}>
      <FieldLabel>{label}</FieldLabel>
      <p className="min-h-8 text-sm font-medium whitespace-pre-line">{value}</p>
    </Field>
  )
}

function DocumentLink({ url, label }: { url: string; label: string }) {
  const href = resolveAssetUrl(url)

  return (
    <Button asChild variant="outline" size="sm">
      <a href={href} target="_blank" rel="noreferrer">
        {label}
        <ExternalLink data-icon="inline-end" />
      </a>
    </Button>
  )
}

type BusinessProfileViewProps = {
  application: VendorApplication
}

export function BusinessProfileView({ application }: BusinessProfileViewProps) {
  const { personal, identity, business } = application
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
  const documentLinks = [
    identity.selfieUrl
      ? { url: identity.selfieUrl, label: "View selfie" }
      : null,
    ...identity.documentImages.map((url, index) => ({
      url,
      label: `View document image ${index + 1}`,
    })),
    business.tradeLicense?.documentUrl
      ? {
          url: business.tradeLicense.documentUrl,
          label: "View trade license",
        }
      : null,
    business.tax?.documentUrl
      ? { url: business.tax.documentUrl, label: "View tax document" }
      : null,
  ].filter((item): item is { url: string; label: string } => Boolean(item))

  return (
    <>
      <section className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <div className="px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-medium sm:text-xl">
                {display(business.storeName)}
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Legal identity and business records from your vendor
                application.
              </p>
            </div>
            <StatusBadge icon={statusBadge.icon} tone={statusBadge.tone}>
              {STATUS_LABEL[application.status]}
            </StatusBadge>
          </div>

          {application.reviewNote.trim() ? (
            <p className="mt-3 rounded-lg bg-muted/60 px-3 py-2 text-sm">
              {application.reviewNote.trim()}
            </p>
          ) : null}

          {application.status === "rejected" ? (
            <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              This application was rejected. Contact support if you need to
              re-apply or correct these records.
            </p>
          ) : null}

          <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            <Metric label="Status" value={STATUS_LABEL[application.status]} />
            <Metric label="Business type" value={businessType} />
            <Metric
              label="Submitted"
              value={formatDateTime(application.submittedAt)}
            />
            <Metric
              label="Reviewed"
              value={formatDateTime(application.reviewedAt)}
            />
          </dl>
        </div>
      </section>

      <div className="flex w-full flex-col gap-5 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5">
        <div>
          <h2 className="text-sm font-medium">Business records</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {application.status === "approved"
              ? "These details were verified when your vendor application was approved. Public storefront information is managed under Store Profile."
              : "Read-only records from your vendor application. Public storefront information is managed under Store Profile."}
          </p>
        </div>

        <Separator />

        <Section
          title="Account holder"
          description="Personal details from your vendor application."
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <DetailField label="Full name" value={display(personal.fullName)} />
            <DetailField label="Email" value={display(personal.email)} />
            <DetailField label="Phone" value={display(personal.phone)} />
            <DetailField
              label="Date of birth"
              value={formatDateOnly(personal.dateOfBirth)}
            />
            <DetailField
              className="sm:col-span-2 xl:col-span-4"
              label="Home address"
              value={formatAddress(personal.address)}
            />
          </div>
        </Section>

        <Separator />

        <Section
          title="Identity"
          description="Government ID submitted for verification."
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <DetailField
              label="Document type"
              value={
                identity.documentType
                  ? DOCUMENT_TYPE_LABEL[identity.documentType]
                  : "—"
              }
            />
            <DetailField
              label="Document number"
              value={maskDocumentNumber(identity.documentNumber)}
            />
          </div>
        </Section>

        <Separator />

        <Section
          title="Business"
          description="Legal business information used for compliance."
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <DetailField
              label="Registered store name"
              value={display(business.storeName)}
            />
            <DetailField label="Business type" value={businessType} />
            <DetailField
              label="Trade license"
              value={display(business.tradeLicense?.number ?? "")}
            />
            <DetailField
              label="Tax ID"
              value={display(business.tax?.taxId ?? "")}
            />
            <DetailField
              className="sm:col-span-2 xl:col-span-4"
              label="Business address"
              value={formatAddress(business.address)}
            />
          </div>
        </Section>

        {documentLinks.length > 0 ? (
          <>
            <Separator />
            <Section
              title="Documents"
              description="Submitted files used during verification."
            >
              <div className="flex flex-wrap gap-2">
                {documentLinks.map((item) => (
                  <DocumentLink
                    key={`${item.label}-${item.url}`}
                    url={item.url}
                    label={item.label}
                  />
                ))}
              </div>
            </Section>
          </>
        ) : null}
      </div>
    </>
  )
}
