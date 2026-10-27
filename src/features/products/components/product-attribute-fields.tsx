import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import {
  emptyAttributeDraft,
  specAssignments,
  type AttributeDraft,
} from "../lib/create-product"
import type { CategoryAttribute } from "../types"

const selectClass =
  "h-9 w-full cursor-pointer rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive dark:bg-input/30"

type ProductAttributeFieldsProps = {
  assignments: CategoryAttribute[]
  drafts: Record<string, AttributeDraft>
  errors: Record<string, string>
  disabled?: boolean
  onChange: (attributeId: string, draft: AttributeDraft) => void
}

export function ProductAttributeFields({
  assignments,
  drafts,
  errors,
  disabled = false,
  onChange,
}: ProductAttributeFieldsProps) {
  const specs = specAssignments(assignments)

  if (specs.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-medium">Details</p>
      {specs.map((assignment) => {
        const id = assignment.attribute.id
        const draft = drafts[id] ?? emptyAttributeDraft()
        const error = errors[id]
        const label = assignment.attribute.unit
          ? `${assignment.attribute.name} (${assignment.attribute.unit})`
          : assignment.attribute.name
        const fieldId = `product-attribute-${id}`

        return (
          <Field key={id} data-invalid={Boolean(error) || undefined}>
            <FieldLabel htmlFor={fieldId}>
              {label}
              {assignment.isRequired ? " *" : ""}
            </FieldLabel>
            <AttributeControl
              id={fieldId}
              assignment={assignment}
              draft={draft}
              error={error}
              disabled={disabled}
              onChange={(next) => onChange(id, next)}
            />
            <FieldError>{error}</FieldError>
          </Field>
        )
      })}
    </div>
  )
}

function AttributeControl({
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

  if (type === "boolean") {
    return (
      <label className="flex items-center gap-2 text-sm">
        <input
          id={id}
          type="checkbox"
          className="size-4 accent-primary"
          checked={draft.boolean === true}
          disabled={disabled}
          onChange={(event) =>
            onChange({ ...draft, boolean: event.target.checked })
          }
        />
        Yes
      </label>
    )
  }

  if (type === "select") {
    return (
      <select
        id={id}
        className={selectClass}
        value={draft.optionIds[0] ?? ""}
        aria-invalid={Boolean(error)}
        disabled={disabled}
        onChange={(event) =>
          onChange({
            ...draft,
            optionIds: event.target.value ? [event.target.value] : [],
          })
        }
      >
        <option value="">Choose an option</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {options.map((option) => {
        const checked = draft.optionIds.includes(option.id)

        return (
          <label key={option.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={checked}
              disabled={disabled}
              onChange={(event) => {
                const optionIds = event.target.checked
                  ? [...draft.optionIds, option.id]
                  : draft.optionIds.filter((item) => item !== option.id)
                onChange({ ...draft, optionIds })
              }}
            />
            {option.label}
          </label>
        )
      })}
    </div>
  )
}
