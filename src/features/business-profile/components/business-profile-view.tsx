import {
  CircleCheck,
  CircleOff,
  ExternalLink,
  ShieldAlert,
  ShieldQuestion,
} from "lucide-react"

import { StatusBadge } from "@/components/shared"
import { resolveAssetUrl } from "@/lib/api/assets"
import { cn } from "@/lib/utils"

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

function maskDocumentNumber(value: string) {
  const trimmed = value.trim()

  if (trimmed.length <= 4) {
    return trimmed || "—"
  }

  return `${"•".repeat(Math.min(trimmed.length - 4, 8))}${trimmed.slice(-4)}`
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div>
        <h2 className="text-sm font-medium">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-border/60 py-3 last:border-0 sm:grid-cols-[minmax(8rem,12rem)_1fr] sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium whitespace-pre-line">{value}</dd>
    </div>
  )
}

function DocumentLink({ url, label }: { url: string; label: string }) {
  const href = resolveAssetUrl(url)

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
      )}
    >
      {label}
      <ExternalLink className="size-3.5" aria-hidden="true" />
    </a>
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

  return (
    <div className="flex flex-col gap-4">
      <Section title="Verification status">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge icon={statusBadge.icon} tone={statusBadge.tone}>
            {STATUS_LABEL[application.status]}
          </StatusBadge>
          {application.reviewedAt ? (
            <span className="text-xs text-muted-foreground">
              Reviewed{" "}
              {new Intl.DateTimeFormat(undefined, {
                dateStyle: "medium",
              }).format(new Date(application.reviewedAt))}
            </span>
          ) : null}
        </div>
        {application.reviewNote.trim() ? (
          <p className="rounded-lg bg-muted/60 px-3 py-2 text-sm">
            {application.reviewNote.trim()}
          </p>
        ) : null}
        {application.status === "approved" ? (
          <p className="text-sm text-muted-foreground">
            These details were verified when your vendor application was
            approved. Public storefront information is managed under Store
            Profile.
          </p>
        ) : null}
      </Section>

      <Section
        title="Account holder"
        description="Personal details from your vendor application."
      >
        <dl>
          <DetailRow label="Full name" value={display(personal.fullName)} />
          <DetailRow label="Email" value={display(personal.email)} />
          <DetailRow label="Phone" value={display(personal.phone)} />
          <DetailRow
            label="Date of birth"
            value={formatDateOnly(personal.dateOfBirth)}
          />
          <DetailRow
            label="Home address"
            value={formatAddress(personal.address)}
          />
        </dl>
      </Section>

      <Section
        title="Identity"
        description="Government ID submitted for verification."
      >
        <dl>
          <DetailRow
            label="Document type"
            value={
              identity.documentType
                ? DOCUMENT_TYPE_LABEL[identity.documentType]
                : "—"
            }
          />
          <DetailRow
            label="Document number"
            value={maskDocumentNumber(identity.documentNumber)}
          />
        </dl>
        <div className="flex flex-col gap-2 pt-1">
          {identity.selfieUrl ? (
            <DocumentLink url={identity.selfieUrl} label="View selfie" />
          ) : null}
          {identity.documentImages.map((url, index) => (
            <DocumentLink
              key={`${url}-${index}`}
              url={url}
              label={`View document image ${index + 1}`}
            />
          ))}
        </div>
      </Section>

      <Section
        title="Business"
        description="Legal business information used for compliance."
      >
        <dl>
          <DetailRow
            label="Registered store name"
            value={display(business.storeName)}
          />
          <DetailRow
            label="Business type"
            value={
              business.businessType
                ? BUSINESS_TYPE_LABEL[business.businessType]
                : "—"
            }
          />
          <DetailRow
            label="Business address"
            value={formatAddress(business.address)}
          />
          <DetailRow
            label="Trade license"
            value={display(business.tradeLicense?.number ?? "")}
          />
          <DetailRow
            label="Tax ID"
            value={display(business.tax?.taxId ?? "")}
          />
        </dl>
        <div className="flex flex-col gap-2 pt-1">
          {business.tradeLicense?.documentUrl ? (
            <DocumentLink
              url={business.tradeLicense.documentUrl}
              label="View trade license"
            />
          ) : null}
          {business.tax?.documentUrl ? (
            <DocumentLink
              url={business.tax.documentUrl}
              label="View tax document"
            />
          ) : null}
        </div>
      </Section>
    </div>
  )
}
