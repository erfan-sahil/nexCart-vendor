import { Plus, Trash2 } from "lucide-react"

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

import {
  emptyOffer,
  type OfferDraft,
  type OfferFieldErrors,
  type OfferMode,
} from "../lib/create-offer"
import {
  emptyAttributeDraft,
  variantAssignments,
  type AttributeDraft,
} from "../lib/create-product"
import type { CategoryAttribute } from "../types"

const selectContentClass =
  "pointer-events-auto z-[70] w-(--radix-select-trigger-width)"

type ProductOfferFieldsProps = {
  mode: OfferMode
  offers: OfferDraft[]
  assignments: CategoryAttribute[]
  errors: Record<string, OfferFieldErrors>
  disabled?: boolean
  canUseVariants: boolean
  onModeChange: (mode: OfferMode) => void
  onChange: (offers: OfferDraft[]) => void
}

export function ProductOfferFields({
  mode,
  offers,
  assignments,
  errors,
  disabled = false,
  canUseVariants,
  onModeChange,
  onChange,
}: ProductOfferFieldsProps) {
  const axes = variantAssignments(assignments)
  const rows = mode === "single" ? offers.slice(0, 1) : offers

  const updateRow = (key: string, patch: Partial<OfferDraft>) => {
    onChange(
      offers.map((offer) =>
        offer.key === key ? { ...offer, ...patch } : offer
      )
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Selling</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <ModeChoice
            name="offer-mode"
            checked={mode === "single"}
            disabled={disabled}
            title="No variants"
            description="One price and one SKU."
            onSelect={() => onModeChange("single")}
          />
          <ModeChoice
            name="offer-mode"
            checked={mode === "variants"}
            disabled={disabled}
            title="Has variants"
            description={
              canUseVariants
                ? "A row for each option, such as size or color."
                : "Choose this to add a row for each option, such as size or color."
            }
            onSelect={() => onModeChange("variants")}
          />
        </div>
      </div>

      {mode === "variants" && axes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          This category has no variant attributes yet. Assign options such as
          size or color to the category, then set them on each variant.
        </p>
      ) : null}

      {rows.map((offer, index) => {
        const fieldErrors = errors[offer.key]

        return (
          <div
            key={offer.key}
            className="flex flex-col gap-3 rounded-lg border border-border p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">
                {mode === "single" ? "Price and stock" : `Variant ${index + 1}`}
                {index === 0 && mode === "variants" ? " · Default" : ""}
              </p>
              {mode === "variants" && rows.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer"
                  disabled={disabled}
                  aria-label={`Remove variant ${index + 1}`}
                  onClick={() =>
                    onChange(offers.filter((item) => item.key !== offer.key))
                  }
                >
                  <Trash2 />
                </Button>
              ) : null}
            </div>

            {mode === "variants" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {axes.map((assignment) => {
                  const id = assignment.attribute.id
                  const draft = offer.attributes[id] ?? emptyAttributeDraft()
                  const error = fieldErrors?.attributes?.[id]
                  const label = assignment.attribute.unit
                    ? `${assignment.attribute.name} (${assignment.attribute.unit})`
                    : assignment.attribute.name

                  return (
                    <Field key={id} data-invalid={Boolean(error) || undefined}>
                      <FieldLabel htmlFor={`offer-${offer.key}-${id}`}>
                        {label}
                      </FieldLabel>
                      <VariantOptionControl
                        id={`offer-${offer.key}-${id}`}
                        assignment={assignment}
                        draft={draft}
                        error={error}
                        disabled={disabled}
                        onChange={(next) =>
                          updateRow(offer.key, {
                            attributes: { ...offer.attributes, [id]: next },
                          })
                        }
                      />
                      <FieldError>{error}</FieldError>
                    </Field>
                  )
                })}
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <Field data-invalid={Boolean(fieldErrors?.sku) || undefined}>
                <FieldLabel htmlFor={`offer-sku-${offer.key}`}>SKU</FieldLabel>
                <Input
                  id={`offer-sku-${offer.key}`}
                  className="h-9"
                  value={offer.sku}
                  placeholder="SHIRT-RED-M"
                  aria-invalid={Boolean(fieldErrors?.sku)}
                  disabled={disabled}
                  onChange={(event) =>
                    updateRow(offer.key, { sku: event.target.value })
                  }
                />
                <FieldError>{fieldErrors?.sku}</FieldError>
              </Field>
              <Field data-invalid={Boolean(fieldErrors?.price) || undefined}>
                <FieldLabel htmlFor={`offer-price-${offer.key}`}>
                  Price
                </FieldLabel>
                <Input
                  id={`offer-price-${offer.key}`}
                  className="h-9"
                  inputMode="decimal"
                  value={offer.price}
                  placeholder="0.00"
                  aria-invalid={Boolean(fieldErrors?.price)}
                  disabled={disabled}
                  onChange={(event) =>
                    updateRow(offer.key, { price: event.target.value })
                  }
                />
                <FieldError>{fieldErrors?.price}</FieldError>
              </Field>
              <Field
                data-invalid={Boolean(fieldErrors?.compareAtPrice) || undefined}
              >
                <FieldLabel htmlFor={`offer-compare-${offer.key}`}>
                  Compare-at price
                </FieldLabel>
                <Input
                  id={`offer-compare-${offer.key}`}
                  className="h-9"
                  inputMode="decimal"
                  value={offer.compareAtPrice}
                  placeholder="Optional"
                  aria-invalid={Boolean(fieldErrors?.compareAtPrice)}
                  disabled={disabled}
                  onChange={(event) =>
                    updateRow(offer.key, { compareAtPrice: event.target.value })
                  }
                />
                <FieldDescription>
                  Leave blank if there is no higher price.
                </FieldDescription>
                <FieldError>{fieldErrors?.compareAtPrice}</FieldError>
              </Field>
              <Field data-invalid={Boolean(fieldErrors?.stock) || undefined}>
                <FieldLabel htmlFor={`offer-stock-${offer.key}`}>
                  Stock
                </FieldLabel>
                <Input
                  id={`offer-stock-${offer.key}`}
                  className="h-9"
                  inputMode="numeric"
                  value={offer.stock}
                  aria-invalid={Boolean(fieldErrors?.stock)}
                  disabled={disabled}
                  onChange={(event) =>
                    updateRow(offer.key, { stock: event.target.value })
                  }
                />
                <FieldError>{fieldErrors?.stock}</FieldError>
              </Field>
            </div>
          </div>
        )
      })}

      {mode === "variants" ? (
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer self-start"
          disabled={disabled || offers.length >= 20}
          onClick={() => onChange([...offers, emptyOffer()])}
        >
          <Plus />
          Add variant
        </Button>
      ) : null}
    </div>
  )
}

function ModeChoice({
  name,
  checked,
  disabled,
  title,
  description,
  onSelect,
}: {
  name: string
  checked: boolean
  disabled: boolean
  title: string
  description: string
  onSelect: () => void
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm ${
        checked ? "border-primary bg-primary/5" : "border-border"
      } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      onClick={() => {
        if (!disabled) {
          onSelect()
        }
      }}
    >
      <input
        type="radio"
        name={name}
        className="mt-0.5 size-4 accent-primary"
        checked={checked}
        disabled={disabled}
        onChange={onSelect}
      />
      <span>
        <span className="block font-medium">{title}</span>
        <span className="mt-0.5 block text-muted-foreground">
          {description}
        </span>
      </span>
    </label>
  )
}

function VariantOptionControl({
  id,
  assignment,
  draft,
  error,
  disabled,
  onChange,
}: {
  id: string
  assignment: CategoryAttribute
  draft: AttributeDraft
  error?: string
  disabled: boolean
  onChange: (draft: AttributeDraft) => void
}) {
  const type = assignment.attribute.type
  const options = assignment.options.filter((option) => option.isActive)

  if (type === "text") {
    return (
      <Input
        id={id}
        className="h-9"
        value={draft.text}
        aria-invalid={Boolean(error)}
        disabled={disabled}
        onChange={(event) => onChange({ ...draft, text: event.target.value })}
      />
    )
  }

  if (type === "number") {
    return (
      <Input
        id={id}
        className="h-9"
        inputMode="decimal"
        value={draft.number}
        aria-invalid={Boolean(error)}
        disabled={disabled}
        onChange={(event) => onChange({ ...draft, number: event.target.value })}
      />
    )
  }

  if (type !== "select") {
    return (
      <p className="text-sm text-muted-foreground">
        This option type cannot be sold as a variant.
      </p>
    )
  }

  return (
    <Select
      value={draft.optionIds[0]}
      disabled={disabled || options.length === 0}
      onValueChange={(value) => onChange({ ...draft, optionIds: [value] })}
    >
      <SelectTrigger
        id={id}
        className="h-9! w-full cursor-pointer"
        aria-invalid={Boolean(error)}
      >
        <SelectValue placeholder="Choose an option" />
      </SelectTrigger>
      <SelectContent
        position="popper"
        align="start"
        side="bottom"
        sideOffset={6}
        collisionPadding={16}
        className={selectContentClass}
      >
        {options.map((option) => (
          <SelectItem
            key={option.id}
            value={option.id}
            className="cursor-pointer"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
