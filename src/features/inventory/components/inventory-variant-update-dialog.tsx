import { useState } from "react"
import { Loader2 } from "lucide-react"

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
import { previewCurrentPrice } from "@/features/products/lib/create-offer"
import type { ProductVariant } from "@/features/products/types"
import { notifyError, notifySuccess } from "@/lib/notify"

import { PRODUCT_STATUS_LABEL } from "../constants"
import { useInventoryVariantRecord, useUpdateInventoryVariant } from "../hooks"
import { formatMoney, formatOptionLabel } from "../lib/format"
import type { CatalogStatus, InventoryVariant } from "../types"

import { StockLevelBadge } from "./stock-level-badge"

const MAX_STOCK = 1_000_000
const MAX_PRICE = 100_000_000
const selectContentClass =
  "pointer-events-auto z-[70] w-(--radix-select-trigger-width)"

type DiscountType = "" | "percent" | "amount"

type InventoryVariantUpdateDialogProps = {
  variant: InventoryVariant | null
  onClose: () => void
}

export function InventoryVariantUpdateDialog({
  variant,
  onClose,
}: InventoryVariantUpdateDialogProps) {
  if (!variant) {
    return null
  }

  return (
    <InventoryVariantUpdateDialogContent variant={variant} onClose={onClose} />
  )
}

function InventoryVariantUpdateDialogContent({
  variant,
  onClose,
}: {
  variant: InventoryVariant
  onClose: () => void
}) {
  const record = useInventoryVariantRecord(variant.product.id, variant.id)
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
            Update variant {variant.sku}
          </DialogDescription>
          <div className="mt-3">
            <StockLevelBadge level={variant.stockLevel} />
          </div>
        </DialogHeader>

        {record.isPending ? (
          <DialogBody>
            <FormSkeleton />
          </DialogBody>
        ) : null}

        {record.isError ? (
          <DialogBody>
            <div role="alert" className="py-10 text-center">
              <p className="text-sm font-medium">Could not load this variant</p>
              <Button
                type="button"
                variant="outline"
                className="mt-4 cursor-pointer"
                onClick={() => {
                  void record.refetch()
                }}
              >
                Try again
              </Button>
            </div>
          </DialogBody>
        ) : null}

        {record.data ? (
          <InventoryVariantUpdateForm
            key={`${record.data.id}:${record.data.updatedAt}`}
            variant={variant}
            record={record.data}
            onClose={onClose}
          />
        ) : (
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={onClose}
            >
              Cancel
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

function InventoryVariantUpdateForm({
  variant,
  record,
  onClose,
}: {
  variant: InventoryVariant
  record: ProductVariant
  onClose: () => void
}) {
  const updateVariant = useUpdateInventoryVariant()
  const [sku, setSku] = useState(record.sku)
  const [priceText, setPriceText] = useState(formatPriceInput(record.price))
  const [stockText, setStockText] = useState(String(record.stock))
  const [discountType, setDiscountType] = useState<DiscountType>(
    record.discountType ?? ""
  )
  const [discountText, setDiscountText] = useState(
    record.discountValue === null ? "" : formatPriceInput(record.discountValue)
  )
  const [status, setStatus] = useState<CatalogStatus>(record.status)
  const [isDefault, setIsDefault] = useState(record.isDefault)
  const [submitted, setSubmitted] = useState(false)

  const draft = readDraft({
    sku,
    priceText,
    stockText,
    discountType,
    discountText,
    status,
    isDefault,
  })
  const unchanged = isUnchanged(draft, record)
  const canSave = !updateVariant.isPending && !(draft.ok && unchanged)
  const currentPrice = previewCurrentPrice(
    priceText,
    discountType,
    discountType ? discountText : ""
  )

  const onSubmit = async () => {
    setSubmitted(true)

    if (!draft.ok || unchanged) {
      return
    }

    try {
      await updateVariant.mutateAsync({
        productId: variant.product.id,
        variantId: variant.id,
        payload: {
          sku: draft.sku,
          price: draft.price,
          stock: draft.stock,
          discountType: draft.discountType,
          discountValue: draft.discountValue,
          status: draft.status,
          isDefault: draft.isDefault,
        },
      })
      notifySuccess("Variant updated")
      onClose()
    } catch (error) {
      notifyError(error, "Could not update this variant.")
    }
  }

  return (
    <>
      <DialogBody>
        <form
          id="inventory-variant-update"
          className="flex flex-col gap-6"
          onSubmit={(event) => {
            event.preventDefault()
            void onSubmit()
          }}
        >
          <section className="flex flex-col gap-3">
            <SectionTitle>Selling</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                data-invalid={submitted && draft.errors.sku ? true : undefined}
              >
                <FieldLabel htmlFor="variant-sku">SKU</FieldLabel>
                <Input
                  id="variant-sku"
                  className="h-9"
                  value={sku}
                  aria-invalid={
                    submitted && draft.errors.sku ? true : undefined
                  }
                  onChange={(event) => setSku(event.target.value)}
                />
                <FieldDescription>
                  Letters, numbers, and hyphens. Saved in uppercase.
                </FieldDescription>
                {submitted && draft.errors.sku ? (
                  <FieldError>{draft.errors.sku}</FieldError>
                ) : null}
              </Field>

              <Field
                data-invalid={
                  submitted && draft.errors.stock ? true : undefined
                }
              >
                <FieldLabel htmlFor="variant-stock">Stock</FieldLabel>
                <Input
                  id="variant-stock"
                  className="h-9"
                  inputMode="numeric"
                  value={stockText}
                  aria-invalid={
                    submitted && draft.errors.stock ? true : undefined
                  }
                  onChange={(event) => setStockText(event.target.value)}
                />
                {submitted && draft.errors.stock ? (
                  <FieldError>{draft.errors.stock}</FieldError>
                ) : null}
              </Field>

              <Field
                data-invalid={
                  submitted && draft.errors.price ? true : undefined
                }
              >
                <FieldLabel htmlFor="variant-price">Original price</FieldLabel>
                <Input
                  id="variant-price"
                  className="h-9"
                  inputMode="decimal"
                  value={priceText}
                  aria-invalid={
                    submitted && draft.errors.price ? true : undefined
                  }
                  onChange={(event) => setPriceText(event.target.value)}
                />
                {submitted && draft.errors.price ? (
                  <FieldError>{draft.errors.price}</FieldError>
                ) : null}
              </Field>

              <Field>
                <FieldLabel htmlFor="variant-discount-type">
                  Discount type
                </FieldLabel>
                <Select
                  value={discountType || "none"}
                  onValueChange={(value) => {
                    const next = value === "none" ? "" : (value as DiscountType)
                    setDiscountType(next)
                    if (!next) {
                      setDiscountText("")
                    }
                  }}
                >
                  <SelectTrigger
                    id="variant-discount-type"
                    className="h-9! w-full cursor-pointer"
                  >
                    <SelectValue placeholder="No discount" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    align="start"
                    side="bottom"
                    sideOffset={6}
                    collisionPadding={16}
                    className={selectContentClass}
                  >
                    <SelectItem value="none" className="cursor-pointer">
                      No discount
                    </SelectItem>
                    <SelectItem value="percent" className="cursor-pointer">
                      Percentage
                    </SelectItem>
                    <SelectItem value="amount" className="cursor-pointer">
                      Amount
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field
                className="sm:col-span-2"
                data-invalid={
                  submitted && draft.errors.discount ? true : undefined
                }
              >
                <FieldLabel htmlFor="variant-discount">Discount</FieldLabel>
                <Input
                  id="variant-discount"
                  className="h-9"
                  inputMode="decimal"
                  placeholder={discountType === "amount" ? "5.00" : "10"}
                  value={discountText}
                  disabled={!discountType}
                  aria-invalid={
                    submitted && draft.errors.discount ? true : undefined
                  }
                  onChange={(event) => setDiscountText(event.target.value)}
                />
                <FieldDescription>
                  {discountType === "percent"
                    ? "Percent taken off the original price."
                    : discountType === "amount"
                      ? "Amount taken off the original price."
                      : "Choose a discount type to enter one."}
                </FieldDescription>
                {submitted && draft.errors.discount ? (
                  <FieldError>{draft.errors.discount}</FieldError>
                ) : null}
              </Field>
            </div>
            <p className="text-sm text-muted-foreground">
              Current price{" "}
              <span className="font-medium text-foreground">
                {currentPrice === null ? "—" : formatMoney(currentPrice)}
              </span>
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <SectionTitle>Catalog</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="variant-status">Status</FieldLabel>
                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value as CatalogStatus)}
                >
                  <SelectTrigger
                    id="variant-status"
                    className="h-9! w-full cursor-pointer"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    align="start"
                    side="bottom"
                    sideOffset={6}
                    collisionPadding={16}
                    className={selectContentClass}
                  >
                    <SelectItem value="active" className="cursor-pointer">
                      {PRODUCT_STATUS_LABEL.active}
                    </SelectItem>
                    <SelectItem value="archived" className="cursor-pointer">
                      {PRODUCT_STATUS_LABEL.archived}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="variant-default">Default</FieldLabel>
                <label className="flex h-9 items-center gap-2 text-sm">
                  <input
                    id="variant-default"
                    type="checkbox"
                    className="size-4 accent-primary"
                    checked={isDefault}
                    disabled={record.isDefault}
                    onChange={(event) => setIsDefault(event.target.checked)}
                  />
                  Default variant
                </label>
                <FieldDescription>
                  {record.isDefault
                    ? "Choose another variant as the default before clearing this one."
                    : "Buyers see this variant first."}
                </FieldDescription>
              </Field>
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <SectionTitle meta={variant.sku}>Options</SectionTitle>
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
            <p className="text-xs text-muted-foreground">
              Options are changed from the product editor.
            </p>
          </section>
        </form>
      </DialogBody>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="inventory-variant-update"
          className="cursor-pointer"
          disabled={!canSave}
        >
          {updateVariant.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          Save
        </Button>
      </DialogFooter>
    </>
  )
}

function SectionTitle({ meta, children }: { meta?: string; children: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {children}
      </h3>
      {meta ? <p className="text-xs text-muted-foreground">{meta}</p> : null}
    </div>
  )
}

function FormSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      <div className="h-24 animate-pulse rounded-xl bg-muted" />
      <div className="h-40 animate-pulse rounded-xl bg-muted" />
      <div className="h-24 animate-pulse rounded-xl bg-muted" />
    </div>
  )
}

type DraftInput = {
  sku: string
  priceText: string
  stockText: string
  discountType: DiscountType
  discountText: string
  status: CatalogStatus
  isDefault: boolean
}

type Draft =
  | {
      ok: true
      sku: string
      price: number
      stock: number
      discountType: "percent" | "amount" | null
      discountValue: number | null
      status: CatalogStatus
      isDefault: boolean
      errors: Record<string, never>
    }
  | {
      ok: false
      errors: {
        sku?: string
        price?: string
        stock?: string
        discount?: string
      }
    }

function readDraft(input: DraftInput): Draft {
  const sku = input.sku.trim().toUpperCase()
  const price = parsePrice(input.priceText)
  const stock = parseStock(input.stockText)
  const errors: Draft["errors"] & {
    sku?: string
    price?: string
    stock?: string
    discount?: string
  } = {}

  if (!/^[A-Z0-9][A-Z0-9-]{1,39}$/.test(sku)) {
    errors.sku = "Use 2–40 letters, numbers, and hyphens."
  }

  if (price === null) {
    errors.price = "Enter a price from 0 to 100,000,000."
  }

  if (stock === null) {
    errors.stock = "Enter a whole number from 0 to 1,000,000."
  }

  let discountValue: number | null = null

  if (input.discountType) {
    discountValue = parsePrice(input.discountText)

    if (discountValue === null || discountValue <= 0) {
      errors.discount = "Enter a discount greater than 0."
    } else if (input.discountType === "percent" && discountValue > 100) {
      errors.discount = "Percentage discount cannot be more than 100."
    } else if (
      input.discountType === "amount" &&
      price !== null &&
      discountValue > price
    ) {
      errors.discount =
        "Discount amount cannot be more than the original price."
    }
  }

  if (errors.sku || errors.price || errors.stock || errors.discount) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    sku,
    price: price as number,
    stock: stock as number,
    discountType: input.discountType || null,
    discountValue: input.discountType ? discountValue : null,
    status: input.status,
    isDefault: input.isDefault,
    errors: {},
  }
}

function isUnchanged(draft: Draft, record: ProductVariant) {
  if (!draft.ok) {
    return false
  }

  const samePrice = Math.abs(draft.price - record.price) < 0.001
  const sameDiscountType = (record.discountType ?? null) === draft.discountType
  const recordDiscount = record.discountValue
  const sameDiscount =
    draft.discountValue === null
      ? recordDiscount === null
      : recordDiscount !== null &&
        Math.abs(draft.discountValue - recordDiscount) < 0.001

  return (
    draft.sku === record.sku &&
    samePrice &&
    draft.stock === record.stock &&
    sameDiscountType &&
    sameDiscount &&
    draft.status === record.status &&
    draft.isDefault === record.isDefault
  )
}

function formatPriceInput(price: number) {
  return Number.isInteger(price) ? String(price) : String(price)
}

function parseStock(value: string) {
  if (!/^\d+$/.test(value.trim())) {
    return null
  }

  const stock = Number(value)

  if (!Number.isSafeInteger(stock) || stock > MAX_STOCK) {
    return null
  }

  return stock
}

function parsePrice(value: string) {
  const trimmed = value.trim()

  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return null
  }

  const price = Number(trimmed)

  if (!Number.isFinite(price) || price > MAX_PRICE) {
    return null
  }

  return price
}
