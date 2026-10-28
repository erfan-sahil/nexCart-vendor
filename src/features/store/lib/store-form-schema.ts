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

const accountHolder = z.string().trim().min(2).max(120)

const accountNumber = z
  .string()
  .trim()
  .min(6)
  .max(34)
  .regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers, and hyphens only")

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
    payoutMethod: z.enum(["", "bank", "mobile"]),
    accountHolderName: z.string().trim().max(120),
    bankName: z.string().trim().max(80),
    branchName: z.string().trim().max(80),
    routingNumber: z.string().trim().max(20),
    provider: z.string().trim().max(40),
    accountNumber: z.string().trim().max(34),
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

    if (!value.payoutMethod) {
      return
    }

    const issue = (path: string, message: string) => {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [path],
        message,
      })
    }

    if (!accountHolder.safeParse(value.accountHolderName).success) {
      issue("accountHolderName", "Enter the account holder name")
    }

    if (value.payoutMethod === "bank") {
      if (value.bankName.trim().length < 2) {
        issue("bankName", "Enter the bank name")
      }

      if (value.branchName.trim().length < 2) {
        issue("branchName", "Enter the branch name")
      }

      if (!accountNumber.safeParse(value.accountNumber).success) {
        issue("accountNumber", "Enter a valid account number")
      }

      return
    }

    if (value.provider.trim().length < 2) {
      issue("provider", "Enter the mobile provider")
    }

    const mobileNumber =
      phone.safeParse(value.accountNumber).success ||
      accountNumber.safeParse(value.accountNumber).success

    if (!mobileNumber) {
      issue("accountNumber", "Enter a mobile number or account number")
    }
  })

export type StoreProfileFormValues = z.infer<typeof storeProfileSchema>
