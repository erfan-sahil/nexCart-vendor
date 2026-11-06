import { z } from "zod"

import {
  MAX_PRODUCT_FEATURE_LENGTH,
  MAX_PRODUCT_FEATURES,
  PRODUCT_STATUSES,
} from "../constants"
import type { CategoryAttribute, Product, ProductAttribute } from "../types"

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const createProductFormSchema = z.object({
  name: z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      if (!value) {
        ctx.addIssue({ code: "custom", message: "Enter a name." })
        return
      }

      if (value.length < 2) {
        ctx.addIssue({
          code: "custom",
          message: "Enter at least 2 characters.",
        })
      }

      if (value.length > 160) {
        ctx.addIssue({
          code: "custom",
          message: "Use 160 characters or fewer.",
        })
      }
    }),
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
  features: z
    .array(z.string())
    .max(MAX_PRODUCT_FEATURES, `Add ${MAX_PRODUCT_FEATURES} features or fewer.`)
    .superRefine((features, ctx) => {
      features.forEach((feature, index) => {
        if (feature.trim().length > MAX_PRODUCT_FEATURE_LENGTH) {
          ctx.addIssue({
            code: "custom",
            path: [index],
            message: `Use ${MAX_PRODUCT_FEATURE_LENGTH} characters or fewer.`,
          })
        }
      })
    }),
  categoryId: z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      if (!/^[a-f\d]{24}$/i.test(value)) {
        ctx.addIssue({ code: "custom", message: "Choose a category." })
      }
    }),
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
  features: [""],
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

function orderedAssignments(
  assignments: CategoryAttribute[],
  role: "spec" | "variant"
) {
  return assignments
    .filter(
      (assignment) =>
        assignment.attribute.isActive && assignment.attribute.role === role
    )
    .slice()
    .sort(
      (left, right) =>
        left.sortOrder - right.sortOrder ||
        left.attribute.name.localeCompare(right.attribute.name)
    )
}

export function specAssignments(assignments: CategoryAttribute[]) {
  return orderedAssignments(assignments, "spec")
}

export function variantAssignments(assignments: CategoryAttribute[]) {
  return orderedAssignments(assignments, "variant")
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
  features?: string[]
  tags?: string[]
  attributes?: ProductAttributeInput[]
  images: string[]
}

export function cleanFeatures(features: string[]) {
  return features.map((feature) => feature.trim()).filter(Boolean)
}

export function featureDrafts(product: Product) {
  if (product.features.length > 0) {
    return product.features
  }

  const lines = product.description
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

  return lines.length > 0 ? lines : [""]
}

export function toCreatePayload(
  form: CreateProductFormValues,
  attributes: ProductAttributeInput[],
  images: string[]
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
    ...(cleanFeatures(form.features).length > 0
      ? { features: cleanFeatures(form.features) }
      : {}),
    ...(tags.length > 0 ? { tags } : {}),
    ...(attributes.length > 0 ? { attributes } : {}),
    images,
  }
}

export type UpdateProductPayload = {
  name: string
  categoryId: string
  status: CreateProductFormValues["status"]
  slug?: string
  shortDescription: string
  features: string[]
  tags: string[]
  attributes: ProductAttributeInput[]
}

export function formFromProduct(product: Product): CreateProductFormValues {
  return {
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription,
    features: featureDrafts(product),
    categoryId: product.categoryId,
    tags: product.tags.join(", "),
    status: product.status,
  }
}

export function draftsFromAttributes(attributes: ProductAttribute[]) {
  const drafts: Record<string, AttributeDraft> = {}

  for (const attribute of attributes) {
    if (attribute.role !== "spec") {
      continue
    }

    drafts[attribute.attributeId] = {
      text: attribute.text ?? "",
      number:
        attribute.number === null || attribute.number === undefined
          ? ""
          : String(attribute.number),
      boolean: attribute.boolean,
      optionIds: attribute.options.map((option) => option.id),
    }
  }

  return drafts
}

export function toUpdatePayload(
  form: CreateProductFormValues,
  attributes: ProductAttributeInput[]
): UpdateProductPayload {
  const tags = form.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)

  return {
    name: form.name.trim(),
    categoryId: form.categoryId,
    status: form.status,
    shortDescription: form.shortDescription.trim(),
    features: cleanFeatures(form.features),
    tags,
    attributes,
    ...(form.slug.trim() ? { slug: form.slug.trim() } : {}),
  }
}
