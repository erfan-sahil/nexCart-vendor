import { useState, type ReactNode } from "react"
import { Check, ImageOff } from "lucide-react"

import { FieldDescription, FieldLegend, FieldSet } from "@/components/ui/field"
import { cn } from "@/lib/utils"

import type { VariantImageChoice } from "../lib/product-images"

type VariantImagePickerProps = {
  name: string
  choices: VariantImageChoice[]
  value: string
  disabled?: boolean
  onChange: (ref: string) => void
}

export function VariantImagePicker({
  name,
  choices,
  value,
  disabled = false,
  onChange,
}: VariantImagePickerProps) {
  const selected = choices.some((choice) => choice.ref === value) ? value : ""

  return (
    <FieldSet className="gap-2" disabled={disabled}>
      <FieldLegend variant="label" className="mb-0">
        Variant image
      </FieldLegend>
      {choices.length === 0 ? (
        <FieldDescription>
          Add product images first, then pick the one shoppers see for this
          variant.
        </FieldDescription>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            <ImageTile
              name={name}
              value=""
              label="No image"
              checked={selected === ""}
              onSelect={onChange}
            >
              <ImageOff className="size-4" aria-hidden />
            </ImageTile>
            {choices.map((choice) => (
              <ImageTile
                key={choice.ref}
                name={name}
                value={choice.ref}
                label={choice.label}
                checked={selected === choice.ref}
                onSelect={onChange}
              >
                <ChoiceImage url={choice.url} />
              </ImageTile>
            ))}
          </div>
          <FieldDescription>
            Shoppers see this image when they pick this variant.
          </FieldDescription>
        </>
      )}
    </FieldSet>
  )
}

function ImageTile({
  name,
  value,
  label,
  checked,
  onSelect,
  children,
}: {
  name: string
  value: string
  label: string
  checked: boolean
  onSelect: (value: string) => void
  children: ReactNode
}) {
  return (
    <label
      title={label}
      className={cn(
        "relative flex size-14 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border bg-muted/40 text-muted-foreground transition-all",
        "has-focus-visible:ring-3 has-focus-visible:ring-ring/50 has-disabled:cursor-not-allowed has-disabled:opacity-60",
        checked
          ? "border-primary ring-2 ring-primary/30"
          : "border-border hover:border-primary/50"
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        className="sr-only"
        onChange={() => onSelect(value)}
      />
      {children}
      <span className="sr-only">{label}</span>
      {checked && value ? (
        <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
          <Check className="size-3" aria-hidden />
        </span>
      ) : null}
    </label>
  )
}

function ChoiceImage({ url }: { url: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return <ImageOff className="size-4" aria-hidden />
  }

  return (
    <img
      src={url}
      alt=""
      className="size-full object-cover"
      onError={() => setFailed(true)}
    />
  )
}
