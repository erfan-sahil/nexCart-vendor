import type { ReactNode } from "react"
import { Archive, CircleCheck, Star, type LucideIcon } from "lucide-react"

import { CustomBadge, type BadgeColor } from "@/components/shared"
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
import { cn } from "@/lib/utils"

import { PRODUCT_STATUS_LABEL, STOCK_LEVEL_LABEL } from "../constants"
import {
  formatInventoryDate,
  formatMoney,
  formatOptionLabel,
  formatUnits,
  hasDiscount,
} from "../lib/format"
import type { CatalogStatus, InventoryVariant } from "../types"

import { StockLevelBadge } from "./stock-level-badge"

const STATUS_BADGE: Record<
  CatalogStatus,
  { icon: LucideIcon; color: BadgeColor }
> = {
  active: { icon: CircleCheck, color: "success" },
  archived: { icon: Archive, color: "neutral" },
}

type InventoryVariantDetailsDialogProps = {
  variant: InventoryVariant | null
  onClose: () => void
  onUpdate: (variant: InventoryVariant) => void
}

export function InventoryVariantDetailsDialog({
  variant,
  onClose,
  onUpdate,
}: InventoryVariantDetailsDialogProps) {
  if (!variant) {
    return null
  }

  return (
    <VariantDetails
      key={variant.id}
      variant={variant}
      onClose={onClose}
      onUpdate={onUpdate}
    />
  )
}

function VariantDetails({
  variant,
  onClose,
  onUpdate,
}: {
  variant: InventoryVariant
  onClose: () => void
  onUpdate: (variant: InventoryVariant) => void
}) {
  const discounted = hasDiscount(variant.price, variant.currentPrice)
  const status = STATUS_BADGE[variant.status]
  const title =
    variant.options.length > 0
      ? formatOptionLabel(variant.options)
      : variant.sku

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        shell
        className="h-[min(44rem,calc(100dvh-2rem))] sm:max-w-3xl"
      >
        <DialogHeader>
          <p className="text-xs font-medium text-brand-text">
            {variant.product.name}
          </p>
          <DialogTitle className="mt-1">{title}</DialogTitle>
          <DialogDescription className="sr-only">
            Variant details for {variant.sku}
          </DialogDescription>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <StockLevelBadge level={variant.stockLevel} />
            <CustomBadge
              name={PRODUCT_STATUS_LABEL[variant.status]}
              color={status.color}
              icon={status.icon}
            />
            {variant.isDefault ? (
              <CustomBadge name="Default" color="brand" icon={Star} />
            ) : null}
          </div>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-6">
          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Fact
              label="Price"
              value={formatMoney(variant.currentPrice)}
              detail={
                discounted ? `Was ${formatMoney(variant.price)}` : undefined
              }
            />
            <Fact
              label="Stock"
              value={
                variant.stock === 0
                  ? "Out of stock"
                  : formatUnits(variant.stock)
              }
              detail={`Low stock at ${formatUnits(variant.lowStockAt)}`}
            />
            <Fact
              label="Level"
              value={STOCK_LEVEL_LABEL[variant.stockLevel]}
              detail={PRODUCT_STATUS_LABEL[variant.status]}
            />
            <Fact
              label="Store"
              value={variant.store.name || "—"}
              detail={formatInventoryDate(variant.updatedAt)}
            />
          </dl>

          <Section title="Options" meta={variant.sku}>
            {variant.options.length > 0 ? (
              <ul className="overflow-hidden rounded-lg border border-border">
                {variant.options.map((option) => (
                  <li
                    key={`${option.name}:${option.value}`}
                    className="flex items-baseline justify-between gap-3 border-b border-border px-3 py-2.5 text-sm last:border-b-0"
                  >
                    <span className="text-muted-foreground">{option.name}</span>
                    <span className="min-w-0 truncate font-medium">
                      {option.value}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
                This variant has no options.
              </p>
            )}
          </Section>

          <Section title="Record">
            <FactList
              items={[
                { label: "SKU", value: variant.sku },
                { label: "Product", value: variant.product.name },
                {
                  label: "Status",
                  value: PRODUCT_STATUS_LABEL[variant.status],
                },
                {
                  label: "Default",
                  value: variant.isDefault ? "Yes" : "No",
                },
                {
                  label: "Created",
                  value: formatInventoryDate(variant.createdAt),
                },
                {
                  label: "Updated",
                  value: formatInventoryDate(variant.updatedAt),
                },
              ]}
            />
          </Section>
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            type="button"
            className="cursor-pointer"
            onClick={() => onUpdate(variant)}
          >
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Section({
  title,
  meta,
  className,
  children,
}: {
  title: string
  meta?: string
  className?: string
  children: ReactNode
}) {
  return (
    <section className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {title}
        </h3>
        {meta ? <p className="text-xs text-muted-foreground">{meta}</p> : null}
      </div>
      {children}
    </section>
  )
}

function Fact({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail?: string
}) {
  return (
    <div className="min-w-0 rounded-lg border border-border px-3 py-2.5">
      <dt className="text-[0.65rem] tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-1 truncate text-sm font-medium">{value}</dd>
      {detail ? (
        <dd className="truncate text-xs text-muted-foreground">{detail}</dd>
      ) : null}
    </div>
  )
}

function FactList({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="bg-card px-3 py-2.5">
          <dt className="text-xs text-muted-foreground">{item.label}</dt>
          <dd className="mt-0.5 text-sm wrap-break-word">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
