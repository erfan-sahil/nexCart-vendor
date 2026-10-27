import { z } from "zod"

import {
  buildOfferPayloads,
  type OfferDraft,
  type OfferMode,
} from "./create-offer"
import { createProductFormSchema } from "./create-product"
import type { CategoryAttribute } from "../types"

const attributeDraftSchema = z.object({
  text: z.string(),
  number: z.string(),
  boolean: z.boolean().nullable(),
  optionIds: z.array(z.string()),
})

const offerDraftSchema = z.object({
  key: z.string(),
  sku: z.string(),
  price: z.string(),
  discountType: z.enum(["", "percent", "amount"]),
  discountValue: z.string(),
  stock: z.string(),
  attributes: z.record(attributeDraftSchema),
})

const productFormObject = createProductFormSchema.extend({
  images: z.array(z.string()),
  offerMode: z.enum(["single", "variants"]),
  offers: z.array(offerDraftSchema),
})

export type ProductFormValues = z.infer<typeof productFormObject>

type ProductFormSchemaOptions = {
  requireImages: boolean
  requireOffers: boolean
  assignments: CategoryAttribute[]
}

function offersStarted(mode: OfferMode, offers: OfferDraft[]) {
  return (
    mode === "variants" ||
    offers.some(
      (offer) =>
        offer.sku.trim() !== "" ||
        offer.price.trim() !== "" ||
        offer.discountType !== "" ||
        offer.discountValue.trim() !== "" ||
        offer.stock.trim() !== ""
    )
  )
}

function addOfferIssues(
  ctx: z.RefinementCtx,
  offers: OfferDraft[],
  mode: OfferMode,
  assignments: CategoryAttribute[]
) {
  const built = buildOfferPayloads(mode, offers, assignments)
  const rows = mode === "single" ? offers.slice(0, 1) : offers

  rows.forEach((offer, index) => {
    const fieldErrors = built.errors[offer.key]

    if (!fieldErrors) {
      return
    }

    for (const [field, message] of Object.entries(fieldErrors)) {
      if (field === "attributes" && message && typeof message === "object") {
        for (const [attributeId, attributeMessage] of Object.entries(message)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["offers", index, "attributes", attributeId],
            message: attributeMessage,
          })
        }
        continue
      }

      if (typeof message === "string") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["offers", index, field],
          message,
        })
      }
    }
  })

  if (built.message && Object.keys(built.errors).length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["offers"],
      message: built.message,
    })
  }
}

export function buildProductFormSchema({
  requireImages,
  requireOffers,
  assignments,
}: ProductFormSchemaOptions) {
  return productFormObject.superRefine((value, ctx) => {
    if (requireImages && value.images.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["images"],
        message: "Choose at least one image.",
      })
    }

    if (requireOffers || offersStarted(value.offerMode, value.offers)) {
      addOfferIssues(ctx, value.offers, value.offerMode, assignments)
    }
  })
}
