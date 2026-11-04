import { z } from "zod"

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid category")

const slug = z
  .string()
  .trim()
  .min(2, "Slug must be at least 2 characters")
  .max(80)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers, and hyphens"
  )

const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .email("Enter a valid email address")

const phone = z
  .string()
  .trim()
  .regex(
    /^\+[1-9]\d{7,14}$/,
    "Use international format, for example +8801712345678"
  )

export const storeProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(120),
    slug,
    description: z.string().trim().max(2000),
    email,
    phone,
    line1: z.string().trim().min(2, "Enter the street address").max(160),
    line2: z.string().trim().max(160),
    city: z.string().trim().min(2, "Enter the city").max(80),
    state: z.string().trim().min(2, "Enter the state").max(80),
    postalCode: z.string().trim().min(2, "Enter the postal code").max(20),
    country: z.string().trim().min(2, "Enter the country").max(80),
    categoryIds: z
      .array(objectId)
      .min(1, "Select at least one category")
      .max(20, "Select up to 20 categories"),
    returnPolicy: z.string().trim().max(2000),
    shippingPolicy: z.string().trim().max(2000),
    isActive: z.boolean(),
  })
  .superRefine((value, ctx) => {
    const seen = new Set<string>()

    value.categoryIds.forEach((categoryId, index) => {
      if (seen.has(categoryId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["categoryIds", index],
          message: "Each category can be selected once",
        })
      }

      seen.add(categoryId)
    })
  })

export type StoreProfileFormValues = z.infer<typeof storeProfileSchema>
