import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { ScrollArea } from "@/components/ui/scroll-area"

import type { StoreCategoryOption } from "../lib/categories"

type StoreCategoryFieldProps = {
  options: StoreCategoryOption[]
  value: string[]
  error?: string
  disabled?: boolean
  loading?: boolean
  loadError?: string | null
  onChange: (value: string[]) => void
}

export function StoreCategoryField({
  options,
  value,
  error,
  disabled = false,
  loading = false,
  loadError,
  onChange,
}: StoreCategoryFieldProps) {
  const selected = new Set(value)
  const message = error || loadError

  const toggle = (id: string) => {
    if (disabled) {
      return
    }

    if (selected.has(id)) {
      onChange(value.filter((item) => item !== id))
      return
    }

    onChange([...value, id])
  }

  return (
    <Field data-invalid={message ? true : undefined}>
      <FieldLabel>Categories</FieldLabel>
      <ScrollArea type="auto" className="h-64 rounded-lg border border-border">
        <div className="p-2">
          {loading ? (
            <p className="px-2 py-3 text-sm text-muted-foreground">
              Loading categories…
            </p>
          ) : null}
          {!loading && options.length === 0 ? (
            <p className="px-2 py-3 text-sm text-muted-foreground">
              No categories are available yet.
            </p>
          ) : null}
          <ul className="flex flex-col">
            {options.map((option) => {
              const checked = selected.has(option.id)

              return (
                <li key={option.id}>
                  <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted has-disabled:cursor-not-allowed has-disabled:opacity-50">
                    <input
                      type="checkbox"
                      className="size-4 accent-primary"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggle(option.id)}
                    />
                    <span>{option.label}</span>
                  </label>
                </li>
              )
            })}
          </ul>
        </div>
      </ScrollArea>
      <FieldDescription>
        Choose the categories this store sells in.
      </FieldDescription>
      <FieldError>{message}</FieldError>
    </Field>
  )
}
