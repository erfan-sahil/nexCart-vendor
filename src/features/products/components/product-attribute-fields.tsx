import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  emptyAttributeDraft,
  specAssignments,
  type AttributeDraft,
} from "../lib/create-product"
import type { CategoryAttribute } from "../types"

const selectContentClass =
  "pointer-events-auto z-[70] w-(--radix-select-trigger-width)"

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
    <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
      <p className="text-sm font-medium sm:col-span-2">Details</p>
      {specs.map((assignment) => {
        const id = assignment.attribute.id
        const draft = drafts[id] ?? emptyAttributeDraft()
        const error = errors[id]
        const label = assignment.attribute.unit
          ? `${assignment.attribute.name} (${assignment.attribute.unit})`
          : assignment.attribute.name
        const fieldId = `product-attribute-${id}`

        return (
          <Field
            key={id}
            className={
              assignment.attribute.type === "multiselect"
                ? "sm:col-span-2"
                : undefined
            }
            data-invalid={Boolean(error) || undefined}
          >
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
      <Select
        value={draft.optionIds[0]}
        disabled={disabled}
        onValueChange={(value) =>
          onChange({
            ...draft,
            optionIds: [value],
          })
        }
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
