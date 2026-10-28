import type { CreateVariantPayload } from "../services"
import type { CategoryAttribute, ProductVariant } from "../types"
import {
  emptyAttributeDraft,
  variantAssignments,
  type AttributeDraft,
} from "./create-product"

const skuPattern = /^[A-Za-z0-9][A-Za-z0-9-]{1,39}$/
const MAX_OFFERS = 20

export type OfferMode = "single" | "variants"

export type DiscountType = "percent" | "amount"

export type OfferDraft = {
  key: string
  sku: string
  price: string
  discountType: "" | DiscountType
  discountValue: string
  stock: string
  attributes: Record<string, AttributeDraft>
}

export type OfferFieldErrors = {
  sku?: string
  price?: string
  discountType?: string
  discountValue?: string
  stock?: string
  attributes?: Record<string, string>
}

const storedVariantIdPattern = /^[a-f\d]{24}$/i

export function emptyOffer(): OfferDraft {
  return {
    key: crypto.randomUUID(),
    sku: "",
    price: "",
    discountType: "",
    discountValue: "",
    stock: "",
    attributes: {},
  }
}

export function isStoredVariantId(value: string) {
  return storedVariantIdPattern.test(value)
}

export function offersFromVariants(variants: ProductVariant[]) {
  if (variants.length === 0) {
    return {
      offerMode: "single" as const,
      offers: [emptyOffer()],
    }
  }

  const ordered = variants.slice().sort((left, right) => {
    if (left.isDefault !== right.isDefault) {
      return left.isDefault ? -1 : 1
    }

    return left.sku.localeCompare(right.sku)
  })
  const hasOptions = ordered.some((variant) => variant.attributes.length > 0)

  return {
    offerMode:
      hasOptions || ordered.length > 1
        ? ("variants" as const)
        : ("single" as const),
    offers: ordered.map((variant) => ({
      key: variant.id,
      sku: variant.sku,
      price: String(variant.price),
      discountType: variant.discountType ?? "",
      discountValue:
        variant.discountValue === null ? "" : String(variant.discountValue),
      stock: String(variant.stock),
      attributes: Object.fromEntries(
        variant.attributes.map((attribute) => [
          attribute.attributeId,
          {
            text: attribute.text ?? "",
            number: attribute.number === null ? "" : String(attribute.number),
            boolean: attribute.boolean,
            optionIds: attribute.options.map((option) => option.id),
          },
        ])
      ),
    })),
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
    const discount = readDiscount(
      offer.discountType,
      offer.discountValue,
      price
    )
    const stockText = offer.stock.trim()
    const stock = stockText === "" ? null : readStock(stockText)

    if (!priceText) {
      fieldErrors.price = "Enter a price."
    } else if (price === null) {
      fieldErrors.price = "Enter a valid price."
    }

    if (discount.error) {
      fieldErrors[discount.field] = discount.error
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
      discountType: discount.discount?.discountType ?? null,
      discountValue: discount.discount?.discountValue ?? null,
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

function readDiscount(
  type: OfferDraft["discountType"],
  value: string,
  price: number | null
) {
  const text = value.trim()

  if (!type && !text) {
    return { discount: null, error: null, field: "discountValue" as const }
  }

  if (!type) {
    return {
      discount: null,
      error: "Choose percentage or amount.",
      field: "discountType" as const,
    }
  }

  if (!text) {
    return {
      discount: null,
      error: "Enter a discount.",
      field: "discountValue" as const,
    }
  }

  const amount = readMoney(text)

  if (amount === null || amount <= 0) {
    return {
      discount: null,
      error: "Enter a discount greater than 0.",
      field: "discountValue" as const,
    }
  }

  if (type === "percent" && amount > 100) {
    return {
      discount: null,
      error: "Percentage discount cannot be more than 100.",
      field: "discountValue" as const,
    }
  }

  if (type === "amount" && price !== null && amount > price) {
    return {
      discount: null,
      error: "Discount amount cannot be more than the original price.",
      field: "discountValue" as const,
    }
  }

  return {
    discount: { discountType: type, discountValue: amount },
    error: null,
    field: "discountValue" as const,
  }
}

export function previewCurrentPrice(
  priceText: string,
  type: OfferDraft["discountType"],
  valueText: string
) {
  const price = priceText.trim() === "" ? null : readMoney(priceText)

  if (price === null) {
    return null
  }

  if (!type || valueText.trim() === "") {
    return price
  }

  const discount = readDiscount(type, valueText, price)

  if (discount.error || !discount.discount) {
    return null
  }

  if (discount.discount.discountType === "percent") {
    return (
      Math.round(
        (price * (1 - discount.discount.discountValue / 100) + Number.EPSILON) *
          100
      ) / 100
    )
  }

  return (
    Math.round(
      (price - discount.discount.discountValue + Number.EPSILON) * 100
    ) / 100
  )
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
