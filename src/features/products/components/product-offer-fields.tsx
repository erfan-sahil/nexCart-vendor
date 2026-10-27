import { Plus, Trash2 } from "lucide-react"
import {
  Controller,
  useFieldArray,
  useFormState,
  useWatch,
} from "react-hook-form"
import type { Control, FieldPath } from "react-hook-form"

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

import { emptyOffer } from "../lib/create-offer"
import {
  emptyAttributeDraft,
  variantAssignments,
  type AttributeDraft,
} from "../lib/create-product"
import type { ProductFormValues } from "../lib/product-form-schema"
import type { CategoryAttribute } from "../types"

const selectContentClass =
  "pointer-events-auto z-[70] w-(--radix-select-trigger-width)"

type ProductOfferFieldsProps = {
  control: Control<ProductFormValues>
  assignments: CategoryAttribute[]
  disabled?: boolean
  required?: boolean
  canUseVariants: boolean
}

export function ProductOfferFields({
  control,
  assignments,
  disabled = false,
  required = false,
  canUseVariants,
}: ProductOfferFieldsProps) {
  const axes = variantAssignments(assignments)
  const offerMode = useWatch({ control, name: "offerMode" })
  const { errors } = useFormState({ control, name: "offers" })
  const { fields, append, remove } = useFieldArray({
    control,
    name: "offers",
    keyName: "fieldId",
  })
  const rows = offerMode === "single" ? fields.slice(0, 1) : fields
  const offersError = errors.offers
  const offersMessage =
    offersError &&
    "message" in offersError &&
    typeof offersError.message === "string"
      ? offersError.message
      : null

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Selling</p>
        <Controller
          name="offerMode"
          control={control}
          render={({ field }) => (
            <div className="grid gap-2 sm:grid-cols-2">
              <ModeChoice
                name="offer-mode"
                checked={field.value === "single"}
                disabled={disabled}
                title="No variants"
                description="One price and one SKU."
                onSelect={() => field.onChange("single")}
              />
              <ModeChoice
                name="offer-mode"
                checked={field.value === "variants"}
                disabled={disabled}
                title="Has variants"
                description={
                  canUseVariants
                    ? "A row for each option, such as size or color."
                    : "Choose this to add a row for each option, such as size or color."
                }
                onSelect={() => field.onChange("variants")}
              />
            </div>
          )}
        />
      </div>

      {offersMessage ? (
        <p className="text-sm text-destructive" role="alert">
          {offersMessage}
        </p>
      ) : null}

      {offerMode === "variants" && axes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          This category has no variant attributes yet. Assign options such as
          size or color to the category, then set them on each variant.
        </p>
      ) : null}

      {rows.map((offer, index) => (
        <div
          key={offer.fieldId}
          className="flex flex-col gap-3 rounded-lg border border-border p-3"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">
              {offerMode === "single"
                ? "Price and stock"
                : `Variant ${index + 1}`}
              {index === 0 && offerMode === "variants" ? " · Default" : ""}
            </p>
            {offerMode === "variants" && rows.length > 1 ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="cursor-pointer"
                disabled={disabled}
                aria-label={`Remove variant ${index + 1}`}
                onClick={() => remove(index)}
              >
                <Trash2 />
              </Button>
            ) : null}
          </div>

          {offerMode === "variants" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {axes.map((assignment) => {
                const id = assignment.attribute.id
                const label = assignment.attribute.unit
                  ? `${assignment.attribute.name} (${assignment.attribute.unit})`
                  : assignment.attribute.name
                const name =
                  `offers.${index}.attributes.${id}` as FieldPath<ProductFormValues>

                return (
                  <Controller
                    key={id}
                    name={name}
                    control={control}
                    defaultValue={emptyAttributeDraft()}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={`offer-${offer.key}-${id}`}>
                          {label}
                        </FieldLabel>
                        <VariantOptionControl
                          id={`offer-${offer.key}-${id}`}
                          assignment={assignment}
                          draft={
                            (field.value as AttributeDraft | undefined) ??
                            emptyAttributeDraft()
                          }
                          error={fieldState.error?.message}
                          disabled={disabled}
                          onChange={(draft) => field.onChange(draft)}
                        />
                        {fieldState.invalid ? (
                          <FieldError errors={[fieldState.error]} />
                        ) : null}
                      </Field>
                    )}
                  />
                )
              })}
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <OfferInput
              control={control}
              name={`offers.${index}.sku`}
              id={`offer-sku-${offer.key}`}
              label="SKU"
              placeholder="SHIRT-RED-M"
              required={required}
              disabled={disabled}
            />
            <OfferInput
              control={control}
              name={`offers.${index}.price`}
              id={`offer-price-${offer.key}`}
              label="Price"
              placeholder="0.00"
              inputMode="decimal"
              required={required}
              disabled={disabled}
            />
            <OfferInput
              control={control}
              name={`offers.${index}.compareAtPrice`}
              id={`offer-compare-${offer.key}`}
              label="Compare-at price"
              placeholder="Optional"
              inputMode="decimal"
              description="Leave blank if there is no higher price."
              disabled={disabled}
            />
            <OfferInput
              control={control}
              name={`offers.${index}.stock`}
              id={`offer-stock-${offer.key}`}
              label="Stock"
              placeholder="0"
              inputMode="numeric"
              required={required}
              disabled={disabled}
            />
          </div>
        </div>
      ))}

      {offerMode === "variants" ? (
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer self-start"
          disabled={disabled || fields.length >= 20}
          onClick={() => append(emptyOffer())}
        >
          <Plus />
          Add variant
        </Button>
      ) : null}
    </div>
  )
}

function OfferInput({
  control,
  name,
  id,
  label,
  placeholder,
  inputMode,
  description,
  required = false,
  disabled,
}: {
  control: Control<ProductFormValues>
  name: FieldPath<ProductFormValues>
  id: string
  label: string
  placeholder?: string
  inputMode?: "decimal" | "numeric"
  description?: string
  required?: boolean
  disabled: boolean
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={id}>
            {label}
            {required ? " *" : ""}
          </FieldLabel>
          <Input
            id={id}
            className="h-9"
            inputMode={inputMode}
            placeholder={placeholder}
            required={required}
            aria-required={required || undefined}
            aria-invalid={fieldState.invalid}
            disabled={disabled}
            name={field.name}
            ref={field.ref}
            value={typeof field.value === "string" ? field.value : ""}
            onBlur={field.onBlur}
            onChange={field.onChange}
          />
          {description ? (
            <FieldDescription>{description}</FieldDescription>
          ) : null}
          {fieldState.invalid ? (
            <FieldError errors={[fieldState.error]} />
          ) : null}
        </Field>
      )}
    />
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
