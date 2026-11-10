import { Plus, X } from "@/lib/icons"
import { useFormState, useWatch, type Control } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { MAX_PRODUCT_FEATURES } from "../constants"
import type { ProductFormValues } from "../lib/product-form-schema"

type ProductFeatureFieldsProps = {
  control: Control<ProductFormValues>
  disabled?: boolean
  onChange: (features: string[]) => void
}

export function ProductFeatureFields({
  control,
  disabled = false,
  onChange,
}: ProductFeatureFieldsProps) {
  const features = useWatch({ control, name: "features" })
  const { errors } = useFormState({ control, name: "features" })
  const lines = features ?? []
  const atLimit = lines.length >= MAX_PRODUCT_FEATURES
  const listError =
    errors.features && !Array.isArray(errors.features)
      ? errors.features.message
      : undefined

  const updateLine = (index: number, value: string) => {
    const next = [...lines]
    next[index] = value
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-3 sm:col-span-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Specifications</p>
          <FieldDescription>
            Add one feature per line. Shoppers see these as a list.
          </FieldDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || atLimit}
          onClick={() => onChange([...lines, ""])}
        >
          <Plus data-icon="inline-start" />
          Add line
        </Button>
      </div>

      {lines.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
          No specifications yet. Add a line for each feature.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {lines.map((feature, index) => {
            const message = Array.isArray(errors.features)
              ? errors.features[index]?.message
              : undefined

            return (
              <Field
                key={index}
                data-invalid={Boolean(message) || undefined}
                className="gap-1"
              >
                <FieldLabel
                  htmlFor={`product-feature-${index}`}
                  className="sr-only"
                >
                  Feature {index + 1}
                </FieldLabel>
                <div className="flex items-center gap-2">
                  <Input
                    id={`product-feature-${index}`}
                    className="h-9"
                    value={feature}
                    placeholder="6.7-inch OLED display"
                    aria-invalid={Boolean(message)}
                    disabled={disabled}
                    onChange={(event) => updateLine(index, event.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove feature ${index + 1}`}
                    disabled={disabled}
                    onClick={() =>
                      onChange(
                        lines.filter((_, lineIndex) => lineIndex !== index)
                      )
                    }
                  >
                    <X />
                  </Button>
                </div>
                {message ? <FieldError>{message}</FieldError> : null}
              </Field>
            )
          })}
        </div>
      )}
      {listError ? <FieldError>{listError}</FieldError> : null}
    </div>
  )
}
