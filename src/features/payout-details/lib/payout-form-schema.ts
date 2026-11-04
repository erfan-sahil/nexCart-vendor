import { z } from "zod"

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

export const payoutDetailsSchema = z
  .object({
    payoutMethod: z.enum(["", "bank", "mobile"]),
    accountHolderName: z.string().trim().max(120),
    bankName: z.string().trim().max(80),
    branchName: z.string().trim().max(80),
    routingNumber: z.string().trim().max(20),
    provider: z.string().trim().max(40),
    accountNumber: z.string().trim().max(34),
  })
  .superRefine((value, ctx) => {
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

export type PayoutDetailsFormValues = z.infer<typeof payoutDetailsSchema>
