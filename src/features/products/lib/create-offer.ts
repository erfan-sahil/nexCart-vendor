import type { CreateVariantPayload } from "../services"
import type { CategoryAttribute } from "../types"
import {
  emptyAttributeDraft,
  variantAssignments,
  type AttributeDraft,
} from "./create-product"

const skuPattern = /^[A-Za-z0-9][A-Za-z0-9-]{1,39}$/
const MAX_OFFERS = 20

export type OfferMode = "single" | "variants"

export type OfferDraft = {
  key: string
  sku: string
  price: string
  compareAtPrice: string
  stock: string
  attributes: Record<string, AttributeDraft>
}

export type OfferFieldErrors = {
  sku?: string
  price?: string
  compareAtPrice?: string
  stock?: string
  attributes?: Record<string, string>
}

export function emptyOffer(): OfferDraft {
  return {
    key: crypto.randomUUID(),
    sku: "",
    price: "",
    compareAtPrice: "",
    stock: "",
    attributes: {},
  }
}

export function buildOfferPayloads(
  mode: OfferMode,
  offers: OfferDraft[],
  assignments: CategoryAttribute[]
) {
  const axes = variantAssignments(assignments)
  const rows = mode === "single" ? offers.slice(0, 1) : offers
  const errors: Record<string, OfferFieldErrors> = {}
  const payloads: CreateVariantPayload[] = []
  const skus = new Set<string>()
  const signatures = new Set<string>()

  if (rows.length < 1) {
    return {
      payloads,
      errors,
      message: "Add a SKU, price, and stock for this product.",
    }
  }

  if (rows.length > MAX_OFFERS) {
    return {
      payloads,
      errors,
      message: `Add ${MAX_OFFERS} variants or fewer.`,
    }
  }

  rows.forEach((offer, index) => {
    const fieldErrors: OfferFieldErrors = {}
    const sku = offer.sku.trim().toUpperCase()

    if (!sku) {
      fieldErrors.sku = "Enter a SKU."
    } else if (!skuPattern.test(sku)) {
      fieldErrors.sku = "Use 2–40 letters, numbers, and hyphens."
    } else if (skus.has(sku)) {
      fieldErrors.sku = "Each SKU must be unique."
    } else {
      skus.add(sku)
    }

    const priceText = offer.price.trim()
    const price = priceText === "" ? null : readMoney(priceText)
    const compareAt =
      offer.compareAtPrice.trim() === ""
        ? null
        : readMoney(offer.compareAtPrice)
    const stockText = offer.stock.trim()
    const stock = stockText === "" ? null : readStock(stockText)

    if (!priceText) {
      fieldErrors.price = "Enter a price."
    } else if (price === null) {
      fieldErrors.price = "Enter a valid price."
    }

    if (compareAt === null && offer.compareAtPrice.trim() !== "") {
      fieldErrors.compareAtPrice = "Enter a valid compare-at price."
    } else if (price !== null && compareAt !== null && compareAt <= price) {
      fieldErrors.compareAtPrice = "Must be higher than the selling price."
    }

    if (!stockText) {
      fieldErrors.stock = "Enter a stock quantity."
    } else if (stock === null) {
      fieldErrors.stock = "Enter a whole number."
    }

    const attributes =
      mode === "variants"
        ? readVariantAttributes(axes, offer.attributes, fieldErrors)
        : []
    const signature = attributes
      .map((attribute) =>
        [
          attribute.attributeId,
          attribute.text ?? "",
          attribute.number ?? "",
          ...(attribute.optionIds ?? []),
        ].join(":")
      )
      .join("|")

    if (mode === "variants" && signatures.has(signature)) {
      fieldErrors.sku = fieldErrors.sku ?? "These options are already used."
    } else if (mode === "variants") {
      signatures.add(signature)
    }

    if (Object.keys(fieldErrors).length > 0) {
      errors[offer.key] = fieldErrors
      return
    }

    if (price === null || stock === null) {
      return
    }

    payloads.push({
      sku,
      price,
      stock,
      isDefault: index === 0,
      ...(compareAt !== null ? { compareAtPrice: compareAt } : {}),
      ...(mode === "single" ? { simple: true } : { attributes }),
    })
  })

  return {
    payloads,
    errors,
    message:
      Object.keys(errors).length > 0
        ? "Check the SKU, price, stock, and variant fields."
        : null,
  }
}

function readMoney(value: string) {
  const amount = Number(value)

  if (!Number.isFinite(amount) || amount < 0 || amount > 100_000_000) {
    return null
  }

  return Math.round((amount + Number.EPSILON) * 100) / 100
}

function readStock(value: string) {
  if (!/^\d+$/.test(value.trim())) {
    return null
  }

  const stock = Number(value)

  if (!Number.isSafeInteger(stock) || stock > 1_000_000) {
    return null
  }

  return stock
}

function readVariantAttributes(
  axes: CategoryAttribute[],
  drafts: Record<string, AttributeDraft>,
  fieldErrors: OfferFieldErrors
) {
  const attributes: NonNullable<CreateVariantPayload["attributes"]> = []
  const attributeErrors: Record<string, string> = {}

  if (axes.length === 0) {
    fieldErrors.sku = fieldErrors.sku ?? "This category has no variant options."
    return attributes
  }

  for (const assignment of axes) {
    const id = assignment.attribute.id
    const draft = drafts[id] ?? emptyAttributeDraft()
    const type = assignment.attribute.type

    if (type === "text") {
      const text = draft.text.trim()

      if (!text) {
        attributeErrors[id] = "Enter a value."
        continue
      }

      if (text.length > 500) {
        attributeErrors[id] = "Use 500 characters or fewer."
        continue
      }

      attributes.push({ attributeId: id, text })
      continue
    }

    if (type === "number") {
      const number = Number(draft.number)

      if (!draft.number.trim() || !Number.isFinite(number)) {
        attributeErrors[id] = "Enter a number."
        continue
      }

      attributes.push({ attributeId: id, number })
      continue
    }

    if (type !== "select") {
      attributeErrors[id] = "This option cannot be used on a variant."
      continue
    }

    const choices = new Set(
      assignment.options
        .filter((option) => option.isActive)
        .map((option) => option.id)
    )
    const optionId = draft.optionIds.find((item) => choices.has(item))

    if (!optionId) {
      attributeErrors[id] = "Choose an option."
      continue
    }

    attributes.push({ attributeId: id, optionIds: [optionId] })
  }

  if (Object.keys(attributeErrors).length > 0) {
    fieldErrors.attributes = attributeErrors
  }

  return attributes
}
