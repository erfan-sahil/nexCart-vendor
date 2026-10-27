import { z } from "zod"

import { PRODUCT_STATUSES } from "../constants"
import type { CategoryAttribute } from "../types"

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const createProductFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter at least 2 characters.")
    .max(160, "Use 160 characters or fewer."),
  slug: z
    .string()
    .trim()
    .max(80, "Use 80 characters or fewer.")
    .refine(
      (value) => value.length === 0 || value.length >= 2,
      "Slug must be at least 2 characters."
    )
    .refine(
      (value) => value.length === 0 || slugPattern.test(value),
      "Slug must be lowercase and URL-friendly."
    ),
  shortDescription: z.string().trim().max(300, "Use 300 characters or fewer."),
  description: z.string().trim().max(10_000, "Use 10000 characters or fewer."),
  categoryId: z.string().regex(/^[a-f\d]{24}$/i, "Choose a category."),
  tags: z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      const tags = value
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      if (tags.length > 20) {
        ctx.addIssue({
          code: "custom",
          message: "Use 20 tags or fewer.",
        })
      }

      if (tags.some((tag) => tag.length > 40)) {
        ctx.addIssue({
          code: "custom",
          message: "Each tag must be 40 characters or fewer.",
        })
      }

      const unique = new Set(tags.map((tag) => tag.toLowerCase()))

      if (unique.size !== tags.length) {
        ctx.addIssue({
          code: "custom",
          message: "Tags must be unique.",
        })
      }
    }),
  status: z.enum(PRODUCT_STATUSES),
})

export type CreateProductFormValues = z.infer<typeof createProductFormSchema>

export const EMPTY_PRODUCT_FORM: CreateProductFormValues = {
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  categoryId: "",
  tags: "",
  status: "active",
}

export type ProductAttributeInput = {
  attributeId: string
  text?: string
  number?: number
  boolean?: boolean
  optionIds?: string[]
}

export type AttributeDraft = {
  text: string
  number: string
  boolean: boolean | null
  optionIds: string[]
}

export function emptyAttributeDraft(): AttributeDraft {
  return {
    text: "",
    number: "",
    boolean: null,
    optionIds: [],
  }
}

export function specAssignments(assignments: CategoryAttribute[]) {
  return assignments
    .filter(
      (assignment) =>
        assignment.attribute.isActive && assignment.attribute.role === "spec"
    )
    .slice()
    .sort(
      (left, right) =>
        left.sortOrder - right.sortOrder ||
        left.attribute.name.localeCompare(right.attribute.name)
    )
}

export function buildAttributeInputs(
  assignments: CategoryAttribute[],
  drafts: Record<string, AttributeDraft>
) {
  const errors: Record<string, string> = {}
  const inputs: ProductAttributeInput[] = []

  for (const assignment of specAssignments(assignments)) {
    const id = assignment.attribute.id
    const draft = drafts[id] ?? emptyAttributeDraft()
    const required = assignment.isRequired
    const type = assignment.attribute.type

    if (type === "text") {
      const text = draft.text.trim()

      if (!text) {
        if (required) {
          errors[id] = "Enter a value."
        }
        continue
      }

      if (text.length > 500) {
        errors[id] = "Use 500 characters or fewer."
        continue
      }

      inputs.push({ attributeId: id, text })
      continue
    }

    if (type === "number") {
      const raw = draft.number.trim()

      if (!raw) {
        if (required) {
          errors[id] = "Enter a number."
        }
        continue
      }

      const number = Number(raw)

      if (!Number.isFinite(number)) {
        errors[id] = "Enter a valid number."
        continue
      }

      inputs.push({ attributeId: id, number })
      continue
    }

    if (type === "boolean") {
      inputs.push({ attributeId: id, boolean: draft.boolean === true })
      continue
    }

    const activeOptions = new Set(
      assignment.options
        .filter((option) => option.isActive)
        .map((option) => option.id)
    )
    const optionIds = draft.optionIds.filter((optionId) =>
      activeOptions.has(optionId)
    )

    if (type === "select") {
      if (optionIds.length !== 1) {
        if (required) {
          errors[id] = "Choose an option."
        }
        continue
      }

      const optionId = optionIds[0]

      if (optionId) {
        inputs.push({ attributeId: id, optionIds: [optionId] })
      }
      continue
    }

    if (optionIds.length === 0) {
      if (required) {
        errors[id] = "Choose at least one option."
      }
      continue
    }

    inputs.push({ attributeId: id, optionIds })
  }

  return { inputs, errors }
}

export type CreateProductPayload = {
  name: string
  categoryId: string
  status: CreateProductFormValues["status"]
  slug?: string
  shortDescription?: string
  description?: string
  tags?: string[]
  attributes?: ProductAttributeInput[]
}

export function toCreatePayload(
  form: CreateProductFormValues,
  attributes: ProductAttributeInput[]
): CreateProductPayload {
  const tags = form.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)

  return {
    name: form.name.trim(),
    categoryId: form.categoryId,
    status: form.status,
    ...(form.slug.trim() ? { slug: form.slug.trim() } : {}),
    ...(form.shortDescription.trim()
      ? { shortDescription: form.shortDescription.trim() }
      : {}),
    ...(form.description.trim()
      ? { description: form.description.trim() }
      : {}),
    ...(tags.length > 0 ? { tags } : {}),
    ...(attributes.length > 0 ? { attributes } : {}),
  }
}
